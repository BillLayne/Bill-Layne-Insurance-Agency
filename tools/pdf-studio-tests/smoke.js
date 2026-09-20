/**
 * PDF Studio smoke test — runs the real staff flow against a local copy of
 * /pdf-tools/ and fails loudly if anything regresses.
 *
 *   tools\test-pdf-studio.bat            (from the repo root; starts the dev
 *                                         server on :8080 if it is not running)
 *   PDF_STUDIO_URL=https://www.billlayneinsurance.com/pdf-tools/ node smoke.js
 *   FORMS_CODE=<code> node smoke.js      (also exercises packets + shared stamps
 *                                         against the live Forms host, then
 *                                         cleans up after itself)
 *
 * Uses the window.PDFStudio hooks documented in pdf-tools/HANDOFF-PDF-STUDIO.md.
 * Drives the Chrome (or Edge) already installed on the machine — no browser
 * download. Nothing here touches Gmail, SMS or customer data.
 */
'use strict';
const { chromium } = require('playwright-core');
const http = require('http');
const https = require('https');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const URL = process.env.PDF_STUDIO_URL || 'http://localhost:8080/pdf-tools/';
const FORMS_CODE = process.env.FORMS_CODE || '';
const results = [];
const ok = (name, pass, info) => { results.push({ name, pass: !!pass, info }); console.log((pass ? '  PASS ' : '  FAIL ') + name + (info !== undefined && !pass ? '  -> ' + JSON.stringify(info) : '')); };

function isUp(url) {
  return new Promise(res => {
    const r = (url.startsWith('https:') ? https : http).get(url, x => { res(x.statusCode === 200); x.resume(); });
    r.on('error', () => res(false));
    r.setTimeout(2000, () => { r.destroy(); res(false); });
  });
}

async function launch() {
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel, headless: true }); } catch (_) {}
  }
  return chromium.launch({ headless: true });   // a downloaded Chromium, if one exists
}

// ── the in-page helpers every check shares ──
const PRELUDE = `
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const waitFor = async (fn, ms) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (fn()) return true; } catch (_) {} await wait(150); } return false; };
  const P = window.PDFStudio, S = () => P.getState();
  const vis = el => !!el && el.offsetParent !== null;
  const H = sel => Math.round(document.querySelector(sel).getBoundingClientRect().height);
  const inside = el => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1; };
  const makePdf = async (name, pages, text) => {
    const d = await PDFLib.PDFDocument.create();
    for (let i = 1; i <= pages; i++) d.addPage([612, 792]).drawText((text || name) + ' p' + i, { x: 100, y: 700, size: 20 });
    await P.addPdfData(name, new Uint8Array(await d.save()));
    await wait(400);
  };
  const pageText = async (bytes, n) => { const pd = await pdfjsLib.getDocument({ data: bytes.slice() }).promise; const pg = await pd.getPage(n); const tc = await pg.getTextContent(); const c = pd.numPages; pd.destroy(); return { text: tc.items.map(i => i.str).join(' ').toLowerCase(), items: tc.items.length, pages: c }; };
  const openEditor = async i => { P.openEditorFor(i); await waitFor(() => document.getElementById('editModal').classList.contains('open') && document.getElementById('editCanvas').width > 100, 15000); await wait(900); };
  const unbusy = () => { const b = document.getElementById('busy'); if (b) b.classList.remove('show'); };
`;
const evalIn = (page, body) => page.evaluate(new Function('return (async () => {' + PRELUDE + body + '})()'));

(async () => {
  let server = null;
  if (!(await isUp(URL))) {
    if (!URL.startsWith('http://localhost:8080')) { console.error('Cannot reach ' + URL); process.exit(2); }
    console.log('Starting python -m http.server 8080 in ' + ROOT);
    server = spawn('python', ['-m', 'http.server', '8080'], { cwd: ROOT, stdio: 'ignore' });
    for (let i = 0; i < 40 && !(await isUp(URL)); i++) await new Promise(r => setTimeout(r, 250));
  }
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  try {
    console.log('PDF Studio smoke test — ' + URL);
    await page.goto(URL + '?v=' + Date.now(), { waitUntil: 'load' });
    await page.waitForFunction(() => window.PDFStudio && window.PDFLib && window.pdfjsLib, null, { timeout: 20000 });

    // 1. landing
    let r = await evalIn(page, `
      if (document.getElementById('restoreBar').classList.contains('show')) document.getElementById('btnDiscardRestore').click();
      return { shelfHidden: !vis(document.querySelector('.document-shelf')), chipsHidden: !vis(document.querySelector('.device-status')),
        controls: [...document.querySelectorAll('header button, .workflow-shell button, .document-shelf button, .document-shelf select')].filter(vis).length,
        permanentOn: document.getElementById('chkPermanent').checked, badgeShown: document.getElementById('optBadge').classList.contains('show') };`);
    ok('landing: shelf and chips hidden, few controls', r.shelfHidden && r.chipsHidden && r.controls <= 8, r);
    ok('permanent white-out is ON by default, no badge', r.permanentOn && !r.badgeShown, r);
    r = await evalIn(page, `
      const out = { version: P.version, footer: document.getElementById('appVersion').textContent, bodyVersion: document.body.dataset.version };
      document.getElementById('btnHelp').click(); await wait(200);
      out.helpTitle = document.getElementById('studioDialogTitle').textContent;
      out.helpMentionsWhiteout = /permanent/i.test(document.getElementById('studioDialogBody').textContent);
      document.getElementById('studioDialogClose').click(); await wait(100);
      return out;`);
    ok('version stamp in footer + body; Help dialog opens', /^\d{4}-\d{2}-\d{2}/.test(r.version) && r.footer === 'v' + r.version && r.bodyVersion === r.version && r.helpTitle === 'How PDF Studio works' && r.helpMentionsWhiteout, r);
    console.log('  info  PDF Studio version ' + r.version);

    // 2. files, naming, step 2
    r = await evalIn(page, `
      await makePdf('Smith Home Policy.pdf', 3, 'SENSITIVE 12345');
      await makePdf('Second File.pdf', 1);
      return { name: document.getElementById('nameInput').value, hasFiles: document.body.classList.contains('has-files'),
        headerH: H('.app-header'), workflowH: H('.workflow-shell'), everyLabel: document.getElementById('addEverythingLabel').textContent, everyVisible: vis(document.getElementById('btnAddEverything')) };`);
    ok('first file names the PDF', r.name === 'Smith Home Policy', r);
    ok('compact header once files exist (<= 110px)', r.hasFiles && r.headerH + r.workflowH <= 110, r);
    ok('"Add every page (4)" offered on Step 2', r.everyVisible && r.everyLabel === 'Add every page (4)', r);

    // 3. select → add → step 3, delivery surface
    r = await evalIn(page, `
      document.getElementById('btnPickAll').click(); await wait(150); document.getElementById('btnPickAdd').click(); await wait(700);
      const acts = [...document.querySelectorAll('.output-actions > button, .output-actions > .menu-wrap > button')].filter(vis);
      const menus = {};
      for (const [btn, wrap] of [['btnSendMenu','sendMenuWrap'],['btnMoreMenu','moreMenuWrap'],['btnOptMenu','optMenuWrap']]) {
        document.getElementById(btn).click(); await wait(120);
        menus[wrap] = inside(document.querySelector('#' + wrap + ' .menu-panel')); document.body.click(); await wait(60);
      }
      return { tray: S().tray.length, step3: document.body.classList.contains('step-3'), actions: acts.map(b => b.textContent.trim().replace(/\\s+/g, ' ')), rows: [...new Set(acts.map(b => Math.round(b.getBoundingClientRect().top)))].length, menus,
        saveGold: getComputedStyle(document.getElementById('btnCreate')).backgroundColor === 'rgb(200, 168, 78)' };`);
    ok('select all → Add puts 4 pages on Step 3', r.tray === 4 && r.step3, r);
    ok('Step 3 actions on one row: Save, Preview, Send, Export, Settings', r.rows === 1 && r.actions.length === 5, r);
    ok('Send / Export / Settings menus open inside the viewport', Object.values(r.menus).every(Boolean), r);
    ok('Save PDF is gold', r.saveGold, r);

    // 4. permanent white-out through the real build
    r = await evalIn(page, `
      const docId = 1;
      const list = [{ docId, pageIndex: 0, rot: 0, stamps: [{ kind: 'box', x: 90, y: 690, w: 260, h: 34 }] }, { docId, pageIndex: 1, rot: 0, stamps: [] }];
      const perm = await P.buildFinalBytes(list);                       // default options: permanent ON
      const off = await P.buildFinalBytes(list, { numbers: false, shrink: false, lock: false, permanent: false });
      const p1 = await pageText(perm.bytes, 1), p2 = await pageText(perm.bytes, 2), o1 = await pageText(off.bytes, 1);
      unbusy();
      return { pages: p1.pages, p1items: p1.items, p1gone: !p1.text.includes('sensitive'), p2kept: p2.text.includes('p2'), note: perm.note, offStillHasText: o1.text.includes('sensitive') };`);
    ok('permanent white-out removes the covered text (and only on that page)', r.pages === 2 && r.p1items === 0 && r.p1gone && r.p2kept && /made permanent/.test(r.note), r);
    ok('with permanent OFF the text is merely hidden (still in the file)', r.offStillHasText, r);

    // 5. tray: rotate both ways, undo
    r = await evalIn(page, `
      document.querySelector('#trayStrip .tray-card .act-rotl').click(); await wait(250);
      const left = S().tray[0].rot;
      document.querySelector('#trayStrip .tray-card .act-rot').click(); await wait(250);
      const back = S().tray[0].rot;
      const before = S().tray.length; P.addAllToTray(); await wait(400);
      document.activeElement && document.activeElement.blur();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true })); await wait(500);
      return { left, back, before, afterUndo: S().tray.length };`);
    ok('rotate left = 270, rotate right brings it back', r.left === 270 && r.back === 0, r);
    ok('Ctrl+Z undoes the last workspace change', r.afterUndo === r.before, r);

    // 5b. Step 3 multi-select: rotate and remove several pages at once
    r = await evalIn(page, `
      const cards = () => [...document.querySelectorAll('#trayStrip .tray-card')];
      cards()[0].querySelector('.thumb-box').click(); await wait(120);
      cards()[2].querySelector('.thumb-box').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true })); await wait(150);
      const out = { count: document.getElementById('trayPickCount').textContent, barShown: document.getElementById('trayPickBar').classList.contains('show') };
      document.getElementById('btnTrayRotR').click(); await wait(350);
      out.rots = S().tray.map(t => t.rot);
      document.getElementById('btnTrayRotL').click(); await wait(350);
      out.before = S().tray.length;
      document.getElementById('btnTrayRemove').click(); await wait(350);
      out.afterRemove = S().tray.length;
      const undo = [...document.querySelectorAll('#toast button')].find(b => /undo/i.test(b.textContent));
      if (undo) undo.click(); await wait(350);
      out.afterUndo = S().tray.length;
      return out;`);
    ok('Step 3 multi-select: shift-click range, rotate together, remove together, undo', r.barShown && r.count === '3 pages selected' && r.rots.slice(0, 3).every(x => x === 90) && r.afterRemove === r.before - 3 && r.afterUndo === r.before, r);

    // 6. editor: page jump, PageDown, tips, stamps on every page, initials
    r = await evalIn(page, `
      await openEditor(0);
      const jump = document.getElementById('editorPageJump');
      const out = { total: document.getElementById('editorPageTotal').textContent };
      jump.value = '3'; jump.dispatchEvent(new Event('change')); await wait(1500); out.afterJump = jump.value;
      document.activeElement && document.activeElement.blur();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true })); await wait(1500); out.afterPageDown = jump.value;
      document.getElementById('btnHideHints').click(); await wait(150); out.hintsOff = document.body.classList.contains('hints-off');
      document.getElementById('btnShowHints').click(); await wait(150); out.hintsBack = !document.body.classList.contains('hints-off');
      document.getElementById('modeStamps').click(); await wait(300);
      document.getElementById('stampAllPages').checked = true; document.querySelector('#quickStamps .text-chip').click(); await wait(500);
      out.stampsPerPage = S().tray.map(t => t.stamps.length);
      document.getElementById('stampAllPages').checked = false;
      const c = document.createElement('canvas'); c.width = 240; c.height = 90; const x = c.getContext('2d'); x.strokeStyle = '#00f'; x.lineWidth = 6; x.beginPath(); x.moveTo(10, 70); x.bezierCurveTo(60, 10, 120, 80, 230, 20); x.stroke();
      const png = c.toDataURL('image/png');
      const ov = document.getElementById('editOverlay'), rr = ov.getBoundingClientRect();
      document.getElementById('sigKindIni').click(); await wait(100); P.useSignature(png); await wait(400);
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rr.left + rr.width * .5, clientY: rr.top + rr.height * .5 })); await wait(400);
      out.initialsW = Math.round(S().tray[3].stamps.at(-1).w);
      document.getElementById('sigKindSig').click(); await wait(100); P.useSignature(png); await wait(400);
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rr.left + rr.width * .5, clientY: rr.top + rr.height * .65 })); await wait(400);
      out.sigW = Math.round(S().tray[3].stamps.at(-1).w);
      document.getElementById('btnEditDone').click(); await wait(400);
      return out;`);
    ok('editor page jump + PageDown', r.total === '4' && r.afterJump === '3' && r.afterPageDown === '4', r);
    ok('tips can be hidden and shown', r.hintsOff && r.hintsBack, r);
    ok('quick stamp on every page', r.stampsPerPage.every(n => n >= 1), r);
    ok('initials place at 60pt, signatures at 150pt', r.initialsW === 60 && r.sigW === 150, r);

    // 7. OCR text feeds Find
    r = await evalIn(page, `
      const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600; const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 800, 600);
      await P.addImageData('scan.jpg', await new Promise(res => cv.toBlob(res, 'image/jpeg', .9))); await wait(500);
      const imgDoc = S().docs.length;
      P.rememberOcr(imgDoc, 0, 'Policy Number ABC-999');
      document.getElementById('workflowStep2').click(); await wait(200);
      document.getElementById('searchInput').value = 'abc-999'; document.getElementById('btnSearch').click();
      await waitFor(() => document.querySelectorAll('#docList .page-card.search-hit').length > 0, 8000);
      const hits = document.querySelectorAll('#docList .page-card.search-hit').length;
      document.getElementById('btnSearchClear').click(); await wait(100);
      return { hits };`);
    ok('OCR text is searchable with Find', r.hits === 1, r);

    // 7b. the viewer paints the matched words
    r = await evalIn(page, `
      document.getElementById('searchInput').value = 'sensitive'; document.getElementById('btnSearch').click();
      await waitFor(() => document.querySelectorAll('#docList .page-card.search-hit').length > 0, 8000);
      document.querySelector('#docList .page-card.search-hit .zoom-btn').click();
      await waitFor(() => document.getElementById('viewModal').classList.contains('open') && /match/.test(document.getElementById('viewTitle').textContent), 12000);
      const out = { title: document.getElementById('viewTitle').textContent };
      const c = document.getElementById('viewCanvas'), x = c.getContext('2d', { willReadFrequently: true });
      const d = x.getImageData(0, 0, c.width, Math.min(c.height, 400)).data; let yellow = 0;
      for (let i = 0; i < d.length; i += 16) if (d[i] > 200 && d[i+1] > 170 && d[i+2] < 150) yellow++;
      out.yellowPixels = yellow;
      document.getElementById('btnViewClose').click(); await wait(100);
      document.getElementById('btnSearchClear').click(); await wait(100);
      return out;`);
    ok('viewer highlights the Find match', /1 match for "sensitive"/.test(r.title) && r.yellowPixels > 50, r);

    // 7c. projects: save one, start over, resume it from the landing page
    r = await evalIn(page, `
      document.getElementById('btnProjects').click(); await wait(300);
      document.getElementById('projectNameInput').value = 'zz-smoke project'; document.getElementById('saveProjectNow').click();
      await waitFor(() => (document.getElementById('projectList').textContent || '').includes('zz-smoke project'), 8000);
      document.getElementById('studioDialogClose').click(); await wait(150);
      const docsBefore = S().docs.length;
      document.getElementById('btnReset').click(); await wait(300);
      document.getElementById('confirmReset').click(); await wait(600);
      const out = { cleared: S().docs.length === 0 };
      await waitFor(() => vis(document.getElementById('recentProjects')), 6000);
      const chip = [...document.querySelectorAll('#recentList .recent-chip')].find(b => b.textContent.includes('zz-smoke project'));
      out.chipShown = !!chip;
      if (chip) { chip.click(); await waitFor(() => S().docs.length === docsBefore, 8000); }
      out.resumed = S().docs.length === docsBefore;
      return out;`);
    ok('recent projects: save → start over → resume from the landing page', r.cleared && r.chipShown && r.resumed, r);

    // 8. Gmail modal: subject from type + file name, recent recipients
    r = await evalIn(page, `
      localStorage.setItem('bliPdfRecentTo', JSON.stringify(['a@example.com', 'b@example.com']));
      document.getElementById('btnEmail').click(); await wait(300);
      const out = { open: document.getElementById('emailModal').classList.contains('open'), subject: document.getElementById('mailSubject').value, recent: document.querySelectorAll('#mailToList option').length,
        closeLabel: document.getElementById('btnEmailClose').textContent.trim() };
      document.getElementById('btnEmailClose').click(); await wait(150);
      return out;`);
    ok('Gmail subject follows type + file name; recent recipients offered', r.open && /smith home policy/i.test(r.subject) && r.recent === 2 && r.closeLabel === '✕ Close', r);

    // 8b. autosave keeps file bytes in their own store, and a reload restores everything
    r = await evalIn(page, `
      await waitFor(() => /^Saved at/.test(document.getElementById('autosaveStatus').textContent), 8000);
      const rec = await P.sessionGet();
      const bytes = await P.bytesGet(1);
      return { stored: !!rec && rec.stored === true, inlineBytes: rec && rec.docs.some(d => d.bytes), byteLen: bytes ? bytes.length : 0, docs: S().docs.length, tray: S().tray.length, name: document.getElementById('nameInput').value };`);
    ok('autosave writes file bytes once, not in every record', r.stored && !r.inlineBytes && r.byteLen > 500, r);
    const beforeReload = r;
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => window.PDFStudio && window.PDFLib, null, { timeout: 20000 });
    r = await evalIn(page, `
      const offered = await waitFor(() => document.getElementById('restoreBar').classList.contains('show'), 6000);
      if (offered) document.getElementById('btnRestore').click();
      await waitFor(() => S().docs.length > 0, 8000); await wait(400);
      const b = await P.buildPdfBytes([{ docId: 1, pageIndex: 0, rot: 0, stamps: [] }]);
      const t = await pageText(b, 1);
      return { offered, docs: S().docs.length, tray: S().tray.length, name: document.getElementById('nameInput').value, page1: t.text };`);
    ok('reload → Restore brings back files, pages and name', r.offered && r.docs === beforeReload.docs && r.tray === beforeReload.tray && r.name === beforeReload.name && /sensitive/.test(r.page1), r);

    // 9. optional: packets + shared stamps against the live Forms host
    if (FORMS_CODE) {
      r = await evalIn(page, `
        localStorage.setItem('bliFormsCode', ${JSON.stringify(FORMS_CODE)});
        document.getElementById('btnForms').click();
        const listed = await waitFor(() => document.querySelectorAll('#formsList .form-item').length > 0, 15000);
        const packetsBox = vis(document.getElementById('packetsBox'));
        document.getElementById('btnFormsClose').click(); await wait(100);
        await P.shareStamp('text', 'ZZ-SMOKE-STAMP'); await wait(300);
        const shared = (await P.loadSharedStamps(true)).text.includes('ZZ-SMOKE-STAMP');
        const d = await P.loadSharedStamps(true); d.text = d.text.filter(x => x !== 'ZZ-SMOKE-STAMP'); await P.sharedPut('stamps', d);
        const cleaned = !(await P.loadSharedStamps(true)).text.includes('ZZ-SMOKE-STAMP');
        return { listed, packetsBox, shared, cleaned };`);
      ok('Forms Library lists forms and offers packets', r.listed && r.packetsBox, r);
      ok('agency stamps: share, see, remove', r.shared && r.cleaned, r);
    } else {
      console.log('  skip  Forms host checks (set FORMS_CODE to include them)');
    }

    // 10. phone layout
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    r = await evalIn(page, `
      document.getElementById('workflowStep3').click(); await wait(300);
      const acts = [...document.querySelectorAll('.output-actions > button, .output-actions > .menu-wrap > button')].filter(vis);
      const menus = {};
      for (const [btn, wrap] of [['btnSendMenu','sendMenuWrap'],['btnMoreMenu','moreMenuWrap'],['btnOptMenu','optMenuWrap']]) {
        document.getElementById(btn).click(); await wait(120);
        const pnl = document.querySelector('#' + wrap + ' .menu-panel'), pr = pnl.getBoundingClientRect();
        menus[wrap] = { inside: inside(pnl), rect: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)], cls: pnl.className };
        document.body.click(); await wait(60);
      }
      return { chrome: H('.app-header') + H('.workflow-shell'), saveSpans: document.getElementById('btnCreate').getBoundingClientRect().width > 300,
        rows: [...new Set(acts.map(b => Math.round(b.getBoundingClientRect().top)))].length, overflowX: document.documentElement.scrollWidth > innerWidth, menus, vh: innerHeight,
        pctForPages: Math.round(document.getElementById('trayStrip').getBoundingClientRect().height / innerHeight * 100) };`);
    ok('phone: header + steps <= 100px, no sideways scroll', r.chrome <= 100 && !r.overflowX, r);
    ok('phone: Save spans the row, four actions under it, menus inside the screen', r.saveSpans && r.rows === 2 && Object.values(r.menus).every(m => m.inside), r);
    ok('phone: pages get at least 40% of the screen on Step 3', r.pctForPages >= 40, r);

    // 11. console
    const realErrors = consoleErrors.filter(e => !/homepage_hero|404/.test(e));
    ok('no console errors', realErrors.length === 0, realErrors);
  } catch (err) {
    ok('smoke test ran to the end', false, String(err && err.stack || err).slice(0, 600));
  }

  await browser.close();
  if (server) server.kill();
  const failed = results.filter(x => !x.pass);
  console.log('\n' + (failed.length ? 'FAILED ' + failed.length + ' of ' + results.length : 'ALL ' + results.length + ' CHECKS PASSED'));
  process.exit(failed.length ? 1 : 0);
})();
