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
 *
 * The desktop checks run at 1366x768, where the app is the all-in-one workspace
 * (body.ws: pages | live page | tools). The phone checks run at 375x812, where
 * the same markup stacks and the editor opens full screen.
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
  const $ = id => document.getElementById(id);
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
  // page i on screen and drawn (in the workspace the editor is always there; on a phone this opens it)
  const shown = async i => waitFor(() => S().current === i && !S().loading && $('editModal').classList.contains('open') && $('editCanvas').width > 100, 15000);
  const openEditor = async i => { P.openEditorFor(i); await shown(i); await wait(350); };
  const unbusy = () => { const b = $('busy'); if (b) b.classList.remove('show'); };
  const key = (k, extra) => { if (document.activeElement) document.activeElement.blur(); document.body.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, extra || {}))); };
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
      if ($('restoreBar').classList.contains('show')) $('btnDiscardRestore').click();
      return { barHidden: !vis(document.querySelector('.ws-bar')), tabsHidden: !vis(document.querySelector('.ws-tabs')), chipsHidden: !vis(document.querySelector('.device-status')),
        editorHidden: !vis($('editModal')), controls: [...document.querySelectorAll('header button')].filter(vis).length,
        permanentOn: $('chkPermanent').checked, badgeShown: $('optBadge').classList.contains('show') };`);
    ok('landing: no workspace bar, tabs, editor or status chips yet; few controls', r.barHidden && r.tabsHidden && r.chipsHidden && r.editorHidden && r.controls <= 4, r);
    ok('permanent white-out is ON by default, no badge', r.permanentOn && !r.badgeShown, r);
    r = await evalIn(page, `
      const out = { version: P.version, footer: $('appVersion').textContent, bodyVersion: document.body.dataset.version };
      $('btnHelp').click(); await wait(200);
      out.helpTitle = $('studioDialogTitle').textContent;
      out.helpMentionsWhiteout = /permanent/i.test($('studioDialogBody').textContent);
      $('studioDialogClose').click(); await wait(100);
      return out;`);
    ok('version stamp in footer + body; Help dialog opens', /^\d{4}-\d{2}-\d{2}/.test(r.version) && r.footer === 'v' + r.version && r.bodyVersion === r.version && r.helpTitle === 'How PDF Studio works' && r.helpMentionsWhiteout, r);
    console.log('  info  PDF Studio version ' + r.version);

    // 1b. the home screen: intents, sidebar on desktop, tab bar on a phone
    r = await evalIn(page, `
      return { title: document.querySelector('.home-title').textContent, cards: [...document.querySelectorAll('.intent-card')].filter(vis).map(c => c.querySelector('strong').textContent),
        sidebarW: Math.round(document.querySelector('.app-nav').getBoundingClientRect().width), tabBar: vis($('tabBar')), stepper: vis(document.querySelector('.workflow-steps')),
        strip: vis($('linkHelp')), recent: vis($('recentProjects')), avatar: vis($('btnAvatar')) };`);
    ok('home: headline, three intent cards, sidebar, strip, recent projects; no stepper yet',
      r.title === 'What would you like to do?' && r.cards.join('|') === 'Edit a PDF|Combine Files|Start with a Form' && r.sidebarW > 200 && !r.tabBar && !r.stepper && r.strip && r.recent && r.avatar, r);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    r = await evalIn(page, `
      const cards = [...document.querySelectorAll('.intent-card')];
      return { tabs: [...document.querySelectorAll('#tabBar .tab')].filter(vis).map(t => t.textContent.trim()), sidebar: vis(document.querySelector('.app-nav')),
        stacked: new Set(cards.map(c => Math.round(c.getBoundingClientRect().top))).size === 3, overflowX: document.documentElement.scrollWidth > innerWidth,
        tabBarAtBottom: Math.abs($('tabBar').getBoundingClientRect().bottom - innerHeight) <= 2 };`);
    ok('home on a phone: tab bar (New PDF, Projects, Forms, Help), stacked cards, no sideways scroll',
      r.tabs.join('|') === 'New PDF|Projects|Forms|Help' && !r.sidebar && r.stacked && !r.overflowX && r.tabBarAtBottom, r);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(300);

    // 1c. the intent cards, through a real file chooser
    const pdfBuffer = async (label, pages) => Buffer.from(await page.evaluate(async ([label, pages]) => {
      const d = await PDFLib.PDFDocument.create();
      for (let i = 1; i <= pages; i++) d.addPage([612, 792]).drawText(label + ' p' + i, { x: 100, y: 700, size: 20 });
      return Array.from(new Uint8Array(await d.save()));
    }, [label, pages]));
    const startOver = async () => { await evalIn(page, `$('btnReset').click(); await wait(250); $('confirmReset').click(); await wait(600); return true;`); };
    let [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#intentEdit')]);
    await chooser.setFiles([{ name: 'Edit Me.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer('EDIT', 2) }]);
    await page.waitForFunction(() => document.getElementById('editModal').classList.contains('open') && document.getElementById('editCanvas').width > 100, null, { timeout: 20000 });
    r = await evalIn(page, `await shown(0); return { tray: S().tray.length, step3: document.body.classList.contains('step-3'), name: $('nameInput').value, page: $('editorPageJump').value, ws: S().ws, tool: S().tool };`);
    ok('"Edit a PDF": every page lands in the PDF and page 1 is on screen, Select tool ready', r.tray === 2 && r.step3 && r.name === 'Edit Me' && r.page === '1' && r.ws && r.tool === 'select', r);
    await startOver();
    [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#intentCombine')]);
    await chooser.setFiles([{ name: 'First.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer('ONE', 2) }, { name: 'Second.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer('TWO', 1) }]);
    await page.waitForFunction(() => window.PDFStudio.getState().tray.length === 3, null, { timeout: 20000 });
    r = await evalIn(page, `await shown(0); return { tray: S().tray.length, docs: S().docs.length, step3: document.body.classList.contains('step-3'), current: S().current,
      sidebar: vis(document.querySelector('.app-nav')), cards: document.querySelectorAll('#trayStrip .tray-card').length };`);
    ok('"Combine Files": all pages of both files are in the PDF, listed on the left (no sidebar while working)', r.tray === 3 && r.docs === 2 && r.step3 && r.current === 0 && !r.sidebar && r.cards === 3, r);
    await startOver();

    // 2. files, naming, the Source files tab and the empty page area
    r = await evalIn(page, `
      await makePdf('Smith Home Policy.pdf', 3, 'SENSITIVE 12345');
      await makePdf('Second File.pdf', 1);
      return { name: $('nameInput').value, hasFiles: document.body.classList.contains('has-files'), ws: document.body.classList.contains('ws'),
        headerH: H('.app-header'), barH: H('.ws-bar'), everyLabel: $('addEverythingLabel').textContent, everyVisible: vis($('btnAddEverything')),
        sourcesTab: $('wsTabSources').classList.contains('active'), pagesTabOff: $('wsTabPages').disabled, emptyState: vis($('wsEmpty')), emptyLabel: $('emptyAddAllLabel').textContent,
        ctaOff: $('btnPreviewFinal').disabled };`);
    ok('first file names the PDF', r.name === 'Smith Home Policy', r);
    ok('compact chrome once files exist (header + bar <= 130px)', r.hasFiles && r.ws && r.headerH + r.barH <= 130, r);
    ok('Source files tab: "Add every page (4)", and the page area explains what to do', r.everyVisible && r.everyLabel === 'Add every page (4)' && r.sourcesTab && r.pagesTabOff && r.emptyState && r.emptyLabel === 'Add every page (4)' && r.ctaOff, r);

    // 3. select → use → the workspace: pages | live page | tools
    r = await evalIn(page, `
      $('btnPickAll').click(); await wait(150); $('btnPickAdd').click(); await shown(0);
      const L = document.querySelector('.ws-left').getBoundingClientRect(), C = document.querySelector('.ws-center').getBoundingClientRect(), R = document.querySelector('.ws-right').getBoundingClientRect();
      const out = { tray: S().tray.length, step3: document.body.classList.contains('step-3'), current: S().current, pagesTab: $('wsTabPages').classList.contains('active'),
        panes: vis(document.querySelector('.ws-left')) && vis($('editCanvas')) && vis(document.querySelector('.ws-right')) && L.right <= C.left + 1 && C.right <= R.left + 1 && R.right <= innerWidth + 1,
        cards: document.querySelectorAll('#trayStrip .tray-card').length, currentCard: (document.querySelector('#trayStrip .tray-card.current .order-badge') || {}).textContent,
        tools: [...document.querySelectorAll('.tool-grid .mode-btn')].filter(vis).map(b => b.textContent.trim()),
        actions: [...document.querySelectorAll('.page-actions button')].filter(vis).map(b => b.textContent.trim()),
        cta: $('btnPreviewFinal').textContent.trim(), ctaOn: vis($('btnPreviewFinal')) && !$('btnPreviewFinal').disabled, zoom: $('zoomPct').textContent,
        foot: $('footPages').textContent, overflowX: document.documentElement.scrollWidth > innerWidth };
      $('btnWsMore').click(); await wait(150);
      const panel = document.querySelector('#wsMoreWrap .menu-panel');
      out.menu = [...panel.querySelectorAll('button')].map(b => b.textContent.trim());
      out.menuOptions = panel.querySelectorAll('input[type=checkbox]').length;
      out.menuInside = inside(panel);
      document.body.click(); await wait(80);
      $('btnDocMenu').click(); await wait(150);
      out.docMenu = [...document.querySelectorAll('#docMenuWrap .menu-panel button')].filter(vis).map(b => b.textContent.trim());
      out.docMenuInside = inside(document.querySelector('#docMenuWrap .menu-panel'));
      document.body.click(); await wait(80);
      return out;`);
    ok('select all → Use selected: 4 pages in the PDF, page 1 on screen', r.tray === 4 && r.step3 && r.current === 0 && r.pagesTab && r.cards === 4 && r.currentCard === '1', r);
    ok('workspace: page list, live page and tools side by side, nothing off screen', r.panes && !r.overflowX && /^\d+%$/.test(r.zoom) && r.foot === '4 pages in finished PDF', r);
    ok('tools: Select, Add text, Highlight, Draw, White-out, Signature, Add image, Stamps, Crop; four page actions',
      r.tools.join('|') === 'Select|Add text|Highlight|Draw|White-out|Signature|Add image|Stamps|Crop' && r.actions.join('|') === 'Rotate left|Rotate right|Duplicate page|Remove page', r);
    ok('one finishing action; Save, Gmail, SMS, Print, exports and the four options in the ⋯ menu',
      r.cta === 'Preview & finish' && r.ctaOn && r.menu.join('|') === 'Save PDF|Gmail draft|Text via SMS|Print|Split by page ranges|Single pages as ZIP|All new PDFs as ZIP|Remove every page' && r.menuOptions === 4, r);
    ok('the ⋯ menu and the project menu open inside the viewport', r.menuInside && r.docMenuInside && r.docMenu.join('|') === 'Save as a project…|Start another PDF|Duplicate this PDF|Remove this PDF', r);

    // 3b. the stages in the top bar, and the Preview & finish dialog as the delivery surface
    r = await evalIn(page, `
      const lab = n => document.querySelector('#workflowStep' + n + ' strong').textContent;
      const out = { labels: [1, 2, 3].map(lab), current: document.querySelector('.workflow-step.current').id };
      $('workflowStep3').click();
      await waitFor(() => $('studioDialog').open && $('previewPrint') && document.querySelector('#finalPages canvas'), 15000);
      out.dialog = $('studioDialogTitle').textContent;
      out.finish = ['savePreview', 'previewEmail', 'previewSms', 'previewPrint', 'previewSplit', 'previewEach', 'previewZip'].every(id => !!$(id));
      const fb = $('btnFinish');
      out.finishGold = !!fb && getComputedStyle(fb).backgroundColor === 'rgb(200, 168, 78)' && !!fb.closest('#studioDialog > header') && fb.textContent.trim() === 'Finish';
      out.note = ($('finishNote') || {}).textContent || '';
      const dr = $('studioDialog').getBoundingClientRect();
      out.centered = Math.abs((dr.left + dr.right) / 2 - innerWidth / 2) < 4;
      out.options = [...document.querySelectorAll('.finish-opts input')].map(i => i.dataset.opt + ':' + i.checked).join(' ');
      document.querySelector('.finish-opts [data-opt="chkNumbers"]').click();
      out.lockedWhileBuilding = document.querySelector('.finish-opts [data-opt="chkNumbers"]').disabled && $('btnFinish').disabled && $('savePreview').disabled;
      await waitFor(() => /Numbered/.test(($('previewSummary') || {}).textContent || '') && document.querySelector('#finalPages canvas'), 15000);
      out.numbered = $('chkNumbers').checked && /Numbered/.test($('previewSummary').textContent) && $('optBadge').classList.contains('show');
      document.querySelector('.finish-opts [data-opt="chkNumbers"]').click();
      await waitFor(() => $('btnFinish') && !$('btnFinish').disabled && !/Updating|Numbered/.test($('previewSummary').textContent) && document.querySelector('#finalPages canvas'), 15000);
      out.numbersOff = !$('chkNumbers').checked && !$('optBadge').classList.contains('show');
      // closing while a rebuild is still running: the window must stay closed
      document.querySelector('.finish-opts [data-opt="chkShrink"]').click();
      $('studioDialogClose').click(); await wait(2500); unbusy();
      out.staysClosed = !$('studioDialog').open;
      $('chkShrink').checked = false; $('chkShrink').dispatchEvent(new Event('change'));
      $('workflowStep1').click(); await wait(300);
      out.toSources = !document.body.classList.contains('step-3') && document.querySelector('.workflow-step.current').id === 'workflowStep1' && $('wsTabSources').classList.contains('active') && vis($('docList'));
      out.pageStillShown = vis($('editCanvas')) && S().current === 0;
      $('wsTabPages').click(); await wait(300);
      out.back = document.body.classList.contains('step-3') && vis($('trayStrip'));
      return out;`);
    ok('stages: Add files · Edit & arrange · Finish; Finish opens Preview & finish, centred',
      r.labels.join('|') === 'Add files|Edit & arrange|Finish' && r.current === 'workflowStep2' && r.dialog === 'Preview & finish' && r.finish && r.centered, r);
    ok('Preview & finish: a gold Finish in its header; the options rebuild the preview, and nothing can save the old one meanwhile',
      r.finishGold && /saves this PDF to your computer and closes the project/.test(r.note) && r.options === 'chkShrink:false chkNumbers:false chkLock:false chkPermanent:true' && r.lockedWhileBuilding && r.numbered && r.numbersOff && r.staysClosed, r);
    ok('Add files ↔ Source files tab, Pages tab brings the list back; the page stays on screen', r.toSources && r.pageStillShown && r.back, r);

    // 3c. saving: Ctrl+S from the workspace, and the gold button in Preview & finish
    {
      await evalIn(page, `if (document.activeElement) document.activeElement.blur(); return true;`);
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.keyboard.press('Control+s')]);
      const name1 = dl.suggestedFilename();
      await page.click('#btnPreviewFinal');
      await page.waitForFunction(() => document.getElementById('studioDialog').open && document.getElementById('savePreview') && document.querySelector('#finalPages canvas'), null, { timeout: 20000 });
      const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('#savePreview')]);
      const name2 = dl2.suggestedFilename();
      await evalIn(page, `$('studioDialogClose').click(); await wait(200); unbusy(); return true;`);
      ok('Ctrl+S saves from the workspace; Save PDF in Preview & finish saves too (named after the PDF)', name1 === 'Smith Home Policy.pdf' && name2 === 'Smith Home Policy.pdf', { name1, name2 });
    }

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

    // 4b. building again and again (every page switch builds one page) never changes the result
    r = await evalIn(page, `
      const plain = [{ docId: 1, pageIndex: 0, rot: 0, stamps: [] }, { docId: 1, pageIndex: 1, rot: 0, stamps: [] }];
      const marked = [{ docId: 1, pageIndex: 0, rot: 0, stamps: [{ kind: 'text', x: 80, y: 600, text: 'NOTE', size: 14, color: 'black' }] }, plain[1]];
      const a = await P.buildPdfBytes(plain), b = await P.buildPdfBytes(plain), c = await P.buildPdfBytes(marked), d = await P.buildPdfBytes(plain);
      const e = await P.buildPdfBytes([plain[1], plain[0], plain[1]]);
      const ta = await pageText(a, 1), td = await pageText(d, 1), tc = await pageText(c, 1), te = await pageText(e, 3);
      return { sizes: [a.length, b.length, d.length], same: ta.text === td.text, markedHasNote: tc.text.includes('note'), plainHasNoNote: !td.text.includes('note'), repeat: te.pages === 3 && te.text.includes('p2') };`);
    ok('repeat builds from the same file are identical; marking one up never leaks into the next', r.sizes[0] === r.sizes[1] && r.sizes[1] === r.sizes[2] && r.same && r.markedHasNote && r.plainHasNoNote && r.repeat, r);

    // 5. one page: Page actions, the ⋯ on its card, undo
    r = await evalIn(page, `
      await openEditor(0);
      $('btnPageRotL').click(); await wait(350);
      const left = S().tray[0].rot;
      $('btnPageRotR').click(); await wait(350);
      const back = S().tray[0].rot;
      const menuBtn = () => document.querySelectorAll('#trayStrip .tray-card .card-menu')[1];
      menuBtn().click(); await wait(150);
      const menuOpen = $('pageMenuWrap').classList.contains('open') && inside($('pageMenu'));
      const acts = [...document.querySelectorAll('#pageMenu button')].filter(vis).map(b => b.textContent.trim());
      document.querySelector('#pageMenu [data-act="rotr"]').click(); await wait(350);
      const viaMenu = S().tray[1].rot, menuClosed = !$('pageMenuWrap').classList.contains('open');
      menuBtn().click(); await wait(150);
      document.querySelector('#pageMenu [data-act="rotl"]').click(); await wait(350);
      const menuBack = S().tray[1].rot;
      const before = S().tray.length; P.addAllToTray(); await wait(400);
      key('z', { ctrlKey: true }); await wait(600);
      return { left, back, menuOpen, acts, viaMenu, menuClosed, menuBack, before, afterUndo: S().tray.length };`);
    ok('Page actions: rotate left = 270, rotate right brings it back', r.left === 270 && r.back === 0, r);
    ok('the ⋯ on a page card: rotate, duplicate, move, select, remove', r.menuOpen && r.menuClosed && r.acts.join('|') === 'Rotate left|Rotate right|Duplicate|Move up|Move down|Select|Remove' && r.viaMenu === 90 && r.menuBack === 0, r);
    ok('Ctrl+Z undoes the last workspace change', r.afterUndo === r.before, r);

    // 5b. several pages at once: shift-click a range, rotate and remove together
    r = await evalIn(page, `
      const cards = () => [...document.querySelectorAll('#trayStrip .tray-card')];
      cards()[0].querySelector('.thumb-box').click(); await wait(200);
      const out = { clickOpens: S().current === 0 && !$('trayPickBar').classList.contains('show') };
      cards()[2].querySelector('.thumb-box').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true })); await wait(150);
      out.count = $('trayPickCount').textContent; out.barShown = $('trayPickBar').classList.contains('show');
      $('btnTrayRotR').click(); await wait(350);
      out.rots = S().tray.map(t => t.rot);
      $('btnTrayRotL').click(); await wait(350);
      out.before = S().tray.length;
      $('btnTrayRemove').click(); await wait(350);
      out.afterRemove = S().tray.length;
      const undo = [...document.querySelectorAll('#toast button')].find(b => /undo/i.test(b.textContent));
      if (undo) undo.click(); await wait(350);
      out.afterUndo = S().tray.length;
      return out;`);
    ok('a click opens a page; shift-click selects a range to rotate or remove together; undo', r.clickOpens && r.barShown && r.count === '3 pages selected' && r.rots.slice(0, 3).every(x => x === 90) && r.afterRemove === r.before - 3 && r.afterUndo === r.before, r);

    // 5c. duplicate, blank page, and dragging a page to a new place
    r = await evalIn(page, `
      await openEditor(0);
      const before = S().tray.length, docsBefore = S().docs.length;
      $('btnPageDup').click(); await shown(1);
      const out = { afterDup: S().tray.length, dupCurrent: S().current, same: S().tray[0].pageIndex === S().tray[1].pageIndex && S().tray[0].docId === S().tray[1].docId };
      $('btnBlankPage').click(); await waitFor(() => S().tray.length === before + 2, 8000); await shown(2);
      out.afterBlank = S().tray.length; out.blankCurrent = S().current; out.blankDoc = S().docs.some(d => d.name === 'Blank page.pdf');
      const t = await pageText(await P.buildPdfBytes([S().tray[2]]), 1); out.blankIsEmpty = t.items === 0;
      out.nameKept = $('nameInput').value;
      P.travelHistory(-1); await wait(500); P.travelHistory(-1); await wait(700);
      out.afterUndo = S().tray.length; out.docsBack = S().docs.length === docsBefore;
      out.order = S().tray.map(x => x.docId + ':' + x.pageIndex).join(' ');
      return out;`);
    ok('Duplicate page and Add blank page land after the page on screen; undo takes both back',
      r.afterDup === 5 && r.dupCurrent === 1 && r.same && r.afterBlank === 6 && r.blankCurrent === 2 && r.blankDoc && r.blankIsEmpty && r.nameKept === 'Smith Home Policy' && r.afterUndo === 4 && r.docsBack, r);
    const orderBefore = r.order;
    {
      // both cards are in view: a scroll between press and move would change what is under the pointer
      await page.evaluate(() => { document.getElementById('trayStrip').scrollTop = 0; });
      const cards = page.locator('#trayStrip .tray-card');
      await cards.nth(1).dragTo(cards.nth(0), { targetPosition: { x: 60, y: 10 } });
      await page.waitForTimeout(500);
    }
    r = await evalIn(page, `
      const order = S().tray.map(x => x.docId + ':' + x.pageIndex).join(' ');
      P.travelHistory(-1); await wait(600);
      return { order, restored: S().tray.map(x => x.docId + ':' + x.pageIndex).join(' ') };`);
    ok('drag a page above another to reorder; undo puts it back', orderBefore === '1:0 1:1 1:2 2:0' && r.order === '1:1 1:0 1:2 2:0' && r.restored === orderBefore, Object.assign({ orderBefore }, r));

    // 5d. two quick clicks on Add blank page: both pages land (one at a time), one blank file
    r = await evalIn(page, `
      await openEditor(0);
      const before = S().tray.length;
      $('btnBlankPage').click(); $('btnBlankPage').click();
      await waitFor(() => S().tray.length === before + 2, 8000); await wait(400);
      const out = { added: S().tray.length - before, blankFiles: S().docs.filter(d => d.name === 'Blank page.pdf').length };
      P.travelHistory(-1); await wait(500); P.travelHistory(-1); await wait(700);
      out.back = S().tray.length === before && !S().docs.some(d => d.name === 'Blank page.pdf');
      return out;`);
    ok('two quick clicks on Add blank page: two pages, one blank file; undo takes both back', r.added === 2 && r.blankFiles === 1 && r.back, r);

    // 6. the page on screen: jump, PageDown, tips, stamps on every page, initials, Select, live pictures
    r = await evalIn(page, `
      await openEditor(0);
      const jump = $('editorPageJump');
      const out = { total: $('editorPageTotal').textContent };
      jump.value = '3'; jump.dispatchEvent(new Event('change')); await shown(2); out.afterJump = jump.value;
      key('PageDown'); await shown(3); out.afterPageDown = jump.value;
      out.currentCard = (document.querySelector('#trayStrip .tray-card.current .order-badge') || {}).textContent;
      $('btnHideHints').click(); await wait(150); out.hintsOff = document.body.classList.contains('hints-off');
      $('btnShowHints').click(); await wait(150); out.hintsBack = !document.body.classList.contains('hints-off');
      $('modeStamps').click(); await wait(300);
      $('stampAllPages').checked = true; document.querySelector('#quickStamps .text-chip').click(); await wait(500);
      out.stampsPerPage = S().tray.map(t => t.stamps.length);
      $('stampAllPages').checked = false;
      const c = document.createElement('canvas'); c.width = 240; c.height = 90; const x = c.getContext('2d'); x.strokeStyle = '#00f'; x.lineWidth = 6; x.beginPath(); x.moveTo(10, 70); x.bezierCurveTo(60, 10, 120, 80, 230, 20); x.stroke();
      const png = c.toDataURL('image/png');
      const ov = $('editOverlay'), rr = ov.getBoundingClientRect();
      $('sigKindIni').click(); await wait(100); P.useSignature(png); await wait(400);
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rr.left + rr.width * .5, clientY: rr.top + rr.height * .5 })); await wait(400);
      out.initialsW = Math.round(S().tray[3].stamps.at(-1).w);
      $('sigKindSig').click(); await wait(100); P.useSignature(png); await wait(400);
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rr.left + rr.width * .5, clientY: rr.top + rr.height * .65 })); await wait(400);
      out.sigW = Math.round(S().tray[3].stamps.at(-1).w);
      out.toolAfter = S().tool;                                        // back to Select, so a stray click adds nothing
      const n0 = S().tray[3].stamps.length;
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rr.left + 12, clientY: rr.top + 12 })); await wait(150);
      out.clickAddsNothing = S().tray[3].stamps.length === n0 && !document.querySelector('#stampLayer .stamp-el.selected');
      const el = document.querySelector('#stampLayer .stamp-el');
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 5, clientY: 5 })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 })); await wait(150);
      out.selected = !!document.querySelector('#stampLayer .stamp-el.selected');
      key('Delete'); await wait(250);
      out.deleted = S().tray[3].stamps.length === n0 - 1;
      const badge = () => ((document.querySelector('#trayStrip .tray-card.current .stamp-badge') || {}).textContent || '').trim();
      out.baked = await waitFor(() => S().tray.every(t => t.baked) && badge() === '2', 15000);
      out.badge = badge();
      return out;`);
    ok('page jump + PageDown move the page on screen and the highlighted card', r.total === '4' && r.afterJump === '3' && r.afterPageDown === '4' && r.currentCard === '4', r);
    ok('tips can be hidden and shown', r.hintsOff && r.hintsBack, r);
    ok('quick stamp on every page', r.stampsPerPage.every(n => n >= 1), r);
    ok('initials place at 60pt, signatures at 150pt', r.initialsW === 60 && r.sigW === 150, r);
    ok('Select tool: a click on the page adds nothing; pick an added item and Delete removes it', r.toolAfter === 'select' && r.clickAddsNothing && r.selected && r.deleted, r);
    ok('page pictures in the list follow the edits (every marked-up page re-drawn, edit count shown)', r.baked && r.badge === '2', r);

    // 6b. Delete with an item picked on the page removes the item, never the page — even with a page card focused
    r = await evalIn(page, `
      await openEditor(1);
      $('modeText').click(); $('stampText').value = 'DELETE ME';
      const ov = $('editOverlay'), b = ov.getBoundingClientRect();
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.left + b.width * .5, clientY: b.top + b.height * .4 })); await wait(300);
      $('stampText').value = '';
      const out = { pages: S().tray.length, n: S().tray[1].stamps.length };
      const card = document.querySelectorAll('#trayStrip .tray-card')[1];
      card.focus();
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })); await wait(300);
      out.after = S().tray.length; out.nAfter = S().tray[1].stamps.length; out.stillSelected = !!document.querySelector('#stampLayer .stamp-el.selected');
      $('modeSelect').click();
      return out;`);
    ok('Delete with an item picked on the page removes that item, not the page (page card focused)', r.after === r.pages && r.nAfter === r.n - 1 && !r.stillSelected, r);

    // 6c. the mouse wheel over the page turns the pages (Bill, 2026-10-01); zoomed in it scrolls the page first
    {
      const box = await evalIn(page, `await openEditor(0); const b = $('editCanvasWrap').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };`);
      await page.mouse.move(box.x, box.y);
      await page.mouse.wheel(0, 120); await page.waitForTimeout(900);
      const a = await evalIn(page, `await shown(1); return { cur: S().current, hint: $('pageFlipHint').textContent, card: (document.querySelector('#trayStrip .tray-card.current .order-badge') || {}).textContent };`);
      await page.mouse.wheel(0, -120); await page.waitForTimeout(900);
      const b = await evalIn(page, `await shown(0); return S().current;`);
      await page.mouse.wheel(0, -120); await page.waitForTimeout(700);
      const c = await evalIn(page, `return { cur: S().current, hint: $('pageFlipHint').textContent };`);
      await evalIn(page, `$('btnZoomIn').click(); await wait(600); $('btnZoomIn').click(); await wait(900); return true;`);
      await page.mouse.wheel(0, 120); await page.waitForTimeout(700);
      const d = await evalIn(page, `const w = $('editCanvasWrap'); return { cur: S().current, top: w.scrollTop, room: w.scrollHeight - w.clientHeight };`);
      await evalIn(page, `const w = $('editCanvasWrap'); w.scrollTop = w.scrollHeight; await wait(300); return true;`);
      await page.mouse.wheel(0, 120); await page.waitForTimeout(1100);
      const e = await evalIn(page, `await shown(1); const w = $('editCanvasWrap'); return { cur: S().current, top: w.scrollTop };`);
      await page.mouse.wheel(0, -120); await page.waitForTimeout(1100);
      const f = await evalIn(page, `await shown(0); const w = $('editCanvasWrap'); return { cur: S().current, atBottom: w.scrollTop + w.clientHeight >= w.scrollHeight - 2 };`);
      await evalIn(page, `$('btnZoomFit').click(); await wait(700); return true;`);
      ok('mouse wheel over the page turns pages (the list follows); zoomed in it scrolls the page first, then turns at the edge',
        a.cur === 1 && /^Page 2 of \d+$/.test(a.hint) && a.card === '2' && b === 0 && c.cur === 0 && c.hint === 'First page' &&
        d.cur === 0 && d.top > 0 && d.room > 0 && e.cur === 1 && e.top === 0 && f.cur === 0 && f.atBottom, { a, b, c, d, e, f });
      // a trackpad flick is dozens of small steps: one flick turns ONE page, the next flick the next one
      const flick = async () => { for (let k = 0; k < 40; k++) { await page.mouse.wheel(0, 12); await page.waitForTimeout(16); } await page.waitForTimeout(900); };
      await flick();
      const g = await evalIn(page, `await shown(1); return S().current;`);
      await flick();
      const h = await evalIn(page, `await shown(2); return S().current;`);
      await evalIn(page, `await openEditor(0); return true;`);
      ok('a trackpad flick turns one page at a time', g === 1 && h === 2, { g, h });
    }

    // 6d. built-in picture stamps (Bill, 2026-10-01): "Sign here →" and "X", sized for a signature line
    r = await evalIn(page, `
      await openEditor(2);
      $('modeStamps').click(); await wait(300);
      const chips = () => [...document.querySelectorAll('#quickStamps .pic-chip')];
      const out = { names: chips().map(c => c.textContent.trim()), imgs: chips().every(c => c.querySelector('img') && c.querySelector('img').naturalWidth > 0) };
      const before = S().tray.map(t => t.stamps.length);
      chips().find(c => c.textContent.trim() === 'X').click(); await wait(700);
      const x = S().tray[2].stamps.at(-1);
      out.x = { kind: x.kind, w: Math.round(x.w), png: x.dataUrl.startsWith('data:image/png') };
      $('modeStamps').click(); await wait(300);
      $('stampAllPages').checked = true;
      chips().find(c => c.textContent.trim() === 'Sign here').click(); await wait(900);
      $('stampAllPages').checked = false;
      out.added = S().tray.map((t, i) => t.stamps.length - before[i]);
      const sign = S().tray[2].stamps.at(-1);
      out.sign = { kind: sign.kind, w: Math.round(sign.w) };
      const bytes = await P.buildPdfBytes([S().tray[2]]);
      out.built = bytes.length > 4000;
      return out;`);
    ok('built-in Sign here and X picture stamps: X lands 28 pt wide, Sign here 130 pt, and on every page when asked',
      r.names.join('|') === 'Sign here|X' && r.imgs && r.x.kind === 'img' && r.x.w === 28 && r.x.png && r.sign.kind === 'img' && r.sign.w === 130 &&
      r.added[2] === 2 && r.added.every((n, i) => i === 2 || n === 1) && r.built, r);

    // 7. OCR text feeds Find
    r = await evalIn(page, `
      const cv = document.createElement('canvas'); cv.width = 800; cv.height = 600; const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, 800, 600);
      await P.addImageData('scan.jpg', await new Promise(res => cv.toBlob(res, 'image/jpeg', .9))); await wait(500);
      const imgDoc = S().docs.length;
      P.rememberOcr(imgDoc, 0, 'Policy Number ABC-999');
      $('wsTabSources').click(); await wait(200);
      $('searchInput').value = 'abc-999'; $('btnSearch').click();
      await waitFor(() => document.querySelectorAll('#docList .page-card.search-hit').length > 0, 8000);
      const hits = document.querySelectorAll('#docList .page-card.search-hit').length;
      $('btnSearchClear').click(); await wait(100);
      return { hits };`);
    ok('OCR text is searchable with Find', r.hits === 1, r);

    // 7b. the viewer paints the matched words
    r = await evalIn(page, `
      $('searchInput').value = 'sensitive'; $('btnSearch').click();
      await waitFor(() => document.querySelectorAll('#docList .page-card.search-hit').length > 0, 8000);
      document.querySelector('#docList .page-card.search-hit .zoom-btn').click();
      await waitFor(() => $('viewModal').classList.contains('open') && /match/.test($('viewTitle').textContent), 12000);
      const out = { title: $('viewTitle').textContent };
      const c = $('viewCanvas'), x = c.getContext('2d', { willReadFrequently: true });
      const d = x.getImageData(0, 0, c.width, Math.min(c.height, 400)).data; let yellow = 0;
      for (let i = 0; i < d.length; i += 16) if (d[i] > 200 && d[i+1] > 170 && d[i+2] < 150) yellow++;
      out.yellowPixels = yellow;
      $('btnViewClose').click(); await wait(100);
      $('btnSearchClear').click(); await wait(100);
      return out;`);
    ok('viewer highlights the Find match', /1 match for "sensitive"/.test(r.title) && r.yellowPixels > 50, r);

    // 7c. projects: save one, close, resume it from the landing page; then the back arrow's "save & close"
    r = await evalIn(page, `
      $('btnProjects').click(); await wait(300);
      $('projectNameInput').value = 'zz-smoke project'; $('saveProjectNow').click();
      await waitFor(() => ($('projectList').textContent || '').includes('zz-smoke project'), 8000);
      $('studioDialogClose').click(); await wait(150);
      const docsBefore = S().docs.length, chipLabel = $('projectLabel').textContent;
      $('btnReset').click(); await wait(300);
      $('confirmReset').click(); await wait(600);
      const out = { chipLabel, cleared: S().docs.length === 0, home: vis(document.querySelector('.home-title')) };
      await waitFor(() => vis($('recentProjects')), 6000);
      const card = () => [...document.querySelectorAll('#recentList .proj-card')].find(b => b.textContent.includes('zz-smoke project'));
      out.cardShown = !!card();
      if (card()) { card().click(); await waitFor(() => S().docs.length === docsBefore, 8000); await shown(0); }
      out.resumed = S().docs.length === docsBefore && document.body.classList.contains('step-3');
      // the back arrow: save as a project and close in one go
      $('btnWsBack').click(); await wait(300);
      out.closeDialog = $('studioDialogTitle').textContent; out.prefilled = $('closeProjectName').value;
      $('saveAndClose').click(); await waitFor(() => S().docs.length === 0, 8000); await wait(400);
      out.savedAndClosed = S().docs.length === 0 && !$('studioDialog').open;
      await waitFor(() => !!card(), 6000);
      if (card()) { card().click(); await waitFor(() => S().docs.length === docsBefore, 8000); await shown(0); }
      out.resumedAgain = S().docs.length === docsBefore && S().tray.length > 0;
      return out;`);
    ok('recent projects: save → close → resume from the landing page, straight to its pages', r.chipLabel === 'zz-smoke project' && r.cleared && r.home && r.cardShown && r.resumed, r);
    ok('back arrow: "Close this PDF?" saves it as a project and closes; it reopens from the landing page', r.closeDialog === 'Close this PDF?' && r.prefilled === 'zz-smoke project' && r.savedAndClosed && r.resumedAgain, r);

    // 8. Gmail modal: subject from type + file name, recent recipients
    r = await evalIn(page, `
      localStorage.setItem('bliPdfRecentTo', JSON.stringify(['a@example.com', 'b@example.com']));
      $('btnEmail').click(); await wait(300);
      const out = { open: $('emailModal').classList.contains('open'), subject: $('mailSubject').value, recent: document.querySelectorAll('#mailToList option').length,
        closeLabel: $('btnEmailClose').textContent.trim() };
      $('btnEmailPreview').click();
      await waitFor(() => $('studioDialog').open && $('emailBodyPreview') && document.querySelector('#finalPages canvas'), 15000);
      out.review = $('studioDialogTitle').textContent; out.reviewHasSave = !!$('savePreview') && !$('previewEmail');
      $('studioDialogClose').click(); await wait(200); unbusy();
      $('btnEmailClose').click(); await wait(150);
      return out;`);
    ok('Gmail subject follows type + file name; recent recipients offered; its review of body + attachment opens',
      r.open && /smith home policy/i.test(r.subject) && r.recent === 2 && r.closeLabel === '✕ Close' && r.review === 'Review email and attachment' && r.reviewHasSave, r);

    // 8b. autosave keeps file bytes in their own store, and a reload restores everything
    r = await evalIn(page, `
      await waitFor(() => /^Saved at/.test($('autosaveStatus').textContent), 8000);
      const rec = await P.sessionGet();
      const bytes = await P.bytesGet(1);
      return { stored: !!rec && rec.stored === true, inlineBytes: rec && rec.docs.some(d => d.bytes), byteLen: bytes ? bytes.length : 0, docs: S().docs.length, tray: S().tray.length, name: $('nameInput').value,
        baked: S().tray.filter(t => t.baked).length };`);
    ok('autosave writes file bytes once, not in every record', r.stored && !r.inlineBytes && r.byteLen > 500, r);
    const beforeReload = r;
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => window.PDFStudio && window.PDFLib, null, { timeout: 20000 });
    r = await evalIn(page, `
      const offered = await waitFor(() => $('restoreBar').classList.contains('show'), 6000);
      if (offered) $('btnRestore').click();
      await waitFor(() => S().docs.length > 0, 8000); await shown(0);
      const b = await P.buildPdfBytes([{ docId: 1, pageIndex: 0, rot: 0, stamps: [] }]);
      const t = await pageText(b, 1);
      return { offered, docs: S().docs.length, tray: S().tray.length, name: $('nameInput').value, page1: t.text, onPages: document.body.classList.contains('step-3'), baked: S().tray.filter(t => t.baked).length };`);
    ok('reload → Restore brings back files, pages, name and the page pictures, on the Pages tab',
      r.offered && r.docs === beforeReload.docs && r.tray === beforeReload.tray && r.name === beforeReload.name && /sensitive/.test(r.page1) && r.onPages && r.baked === beforeReload.baked, Object.assign({ bakedBefore: beforeReload.baked }, r));

    // 8c. Close without saving, then Ctrl+Z: the autosave holds every file again (not just the page list)
    r = await evalIn(page, `
      $('btnReset').click(); await wait(250); $('confirmReset').click(); await wait(800);
      key('z', { ctrlKey: true });
      await waitFor(() => S().docs.length > 0, 5000);
      await waitFor(() => /^Saved at/.test($('autosaveStatus').textContent), 8000); await wait(400);
      const rec = await P.sessionGet(), have = [];
      for (const d of rec.docs) have.push(!!(await P.bytesGet(d.id)));
      return { docs: S().docs.length, recDocs: rec.docs.length, have };`);
    ok('Close without saving → Ctrl+Z: the autosave holds every file again', r.docs > 0 && r.recDocs === r.docs && r.have.length === r.docs && r.have.every(Boolean), r);

    // 9. optional: packets + shared stamps against the live Forms host
    if (FORMS_CODE) {
      r = await evalIn(page, `
        localStorage.setItem('bliFormsCode', ${JSON.stringify(FORMS_CODE)});
        $('btnForms').click();
        const listed = await waitFor(() => document.querySelectorAll('#formsList .form-item').length > 0, 15000);
        const packetsBox = vis($('packetsBox'));
        $('btnFormsClose').click(); await wait(100);
        await P.shareStamp('text', 'ZZ-SMOKE-STAMP'); await wait(300);
        const shared = (await P.loadSharedStamps(true)).text.includes('ZZ-SMOKE-STAMP');
        const d = await P.loadSharedStamps(true); d.text = d.text.filter(x => x !== 'ZZ-SMOKE-STAMP'); await P.sharedPut('stamps', d);
        await P.sharedPut('stamps', d);   // twice: the office's one-step Undo slot must not hold the test stamp either
        const cleaned = !(await P.loadSharedStamps(true)).text.includes('ZZ-SMOKE-STAMP');
        return { listed, packetsBox, shared, cleaned };`);
      ok('Forms Library lists forms and offers packets', r.listed && r.packetsBox, r);
      ok('agency stamps: share, see, remove', r.shared && r.cleaned, r);
    } else {
      console.log('  skip  Forms host checks (set FORMS_CODE to include them)');
    }

    // 9b. narrowing the window while a new text box is still empty: the box goes, nothing breaks
    r = await evalIn(page, `
      await openEditor(0);
      $('modeText').click(); $('stampText').value = '';
      const ov = $('editOverlay'), b = ov.getBoundingClientRect(), n0 = S().tray[0].stamps.length;
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.left + b.width * .3, clientY: b.top + b.height * .3 })); await wait(250);
      const tx = document.querySelector('#stampLayer .stamp-text.editing');
      if (tx) tx.innerText = '';
      return { n0, editing: !!tx, n1: S().tray[0].stamps.length };`);
    const typingBefore = r;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(600);
    r = await evalIn(page, `return { n: S().tray[0].stamps.length, ws: S().ws, busy: $('busy').classList.contains('show') };`);
    ok('narrowing the window while a new text box is still empty drops the box, no error, no stuck overlay', typingBefore.editing && typingBefore.n1 === typingBefore.n0 + 1 && r.n === typingBefore.n0 && !r.ws && !r.busy, Object.assign({ typingBefore }, r));

    // 10. phone layout: the same screens, one at a time, and a full-screen editor
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    r = await evalIn(page, `
      const out = { ws: document.body.classList.contains('ws'), editorClosed: !vis($('editModal')) };
      $('wsTabPages').click(); await wait(300);
      out.chrome = H('.app-header') + H('.ws-bar'); out.overflowX = document.documentElement.scrollWidth > innerWidth;
      out.cta = vis($('btnPreviewFinal')) && inside($('btnPreviewFinal'));
      out.pctForPages = Math.round($('trayStrip').getBoundingClientRect().height / innerHeight * 100);
      const tops = [...document.querySelectorAll('#trayStrip .tray-card')].map(c => Math.round(c.getBoundingClientRect().top));
      out.perRow = tops.filter(t => t === tops[0]).length;
      $('btnWsMore').click(); await wait(150);
      out.menuInside = inside(document.querySelector('#wsMoreWrap .menu-panel'));
      document.body.click(); await wait(80);
      document.querySelectorAll('#trayStrip .tray-card .card-menu')[0].click(); await wait(150);
      out.pageMenu = [...document.querySelectorAll('#pageMenu button')].filter(vis).map(b => b.textContent.trim()).join('|');
      out.pageMenuInside = inside($('pageMenu'));
      document.body.click(); await wait(80);
      document.querySelector('#trayStrip .tray-card .thumb-box').click(); await shown(0);
      const er = $('editModal').getBoundingClientRect();
      out.fullScreen = getComputedStyle($('editModal')).position === 'fixed' && er.width >= innerWidth - 1 && er.height >= innerHeight - 1;
      out.toolMenu = vis($('mobileTool')) && !vis(document.querySelector('.ws-right')) && S().tool === 'text';
      out.barInside = [...document.querySelectorAll('.ed-bar > button, .ed-bar > .ed-zoom, .ed-bar > .menu-wrap')].filter(vis).every(inside);
      $('btnEditDone').click(); await wait(400);
      out.doneCloses = !vis($('editModal')) && vis($('trayStrip'));
      $('wsTabSources').click(); await wait(250);
      out.sources = vis($('docList')) && !vis($('trayStrip'));
      $('wsTabPages').click(); await wait(250);
      return out;`);
    ok('phone: header + bar <= 160px, the finishing action on screen, no sideways scroll', !r.ws && r.editorClosed && r.chrome <= 160 && r.cta && !r.overflowX, r);
    ok('phone: pages two to a row with at least 40% of the screen; menus inside the screen', r.perRow === 2 && r.pctForPages >= 40 && r.menuInside && r.pageMenuInside && r.pageMenu === 'Edit this page|Rotate left|Rotate right|Duplicate|Move later|Select|Remove', r);
    ok('phone: tapping a page opens the full-screen editor (tools in a menu); Done returns to the list', r.fullScreen && r.toolMenu && r.barInside && r.doneCloses && r.sources, r);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(500);
    r = await evalIn(page, `await shown(0); return { ws: document.body.classList.contains('ws'), shown: vis($('editCanvas')) && S().current === 0, overflowX: document.documentElement.scrollWidth > innerWidth };`);
    ok('back to a wide window: the workspace returns with a page on screen', r.ws && r.shown && !r.overflowX, r);

    // 10b. the "Set up my phone" link (#gw=...) must leave a working app behind
    {
      const cfg = Buffer.from(JSON.stringify({ u: 'https://script.google.com/macros/s/SMOKE-TEST/exec', s: 'smoke' })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const p2 = await ctx2.newPage();
      const errs = [];
      p2.on('pageerror', e => errs.push(e.message));
      await p2.goto(URL + '?v=' + Date.now() + '#gw=' + cfg, { waitUntil: 'load' });
      await p2.waitForTimeout(1500);
      const g = await p2.evaluate(() => ({ app: typeof window.PDFStudio === 'object', hashCleared: !location.hash, connected: !!localStorage.getItem('bliMailGateway.url'), chip: (document.getElementById('mailConnection') || {}).textContent }));
      await ctx2.close();
      ok('phone-setup link connects Gmail, clears the link from the address bar and the app still starts', g.app && g.hashCleared && g.connected && /Gmail configured/.test(g.chip || '') && !errs.length, Object.assign({ errs }, g));
    }

    // 12. Finish (Bill, 2026-10-01): one click ends the job — saves the PDF once, keeps the project, closes it
    {
      const downloads = [];
      const onDl = d => downloads.push(d.suggestedFilename());
      page.on('download', onDl);
      r = await evalIn(page, `
        await openEditor(0);
        $('btnPreviewFinal').click();
        await waitFor(() => $('studioDialog').open && $('btnFinish') && document.querySelector('#finalPages canvas'), 15000);
        const out = { note: $('finishNote').textContent, pages: S().tray.length, name: $('nameInput').value };
        $('btnFinish').click();
        await waitFor(() => S().docs.length === 0, 10000); await wait(700);
        out.closed = S().docs.length === 0 && !$('studioDialog').open && vis(document.querySelector('.home-title'));
        out.toast = $('toast').textContent;
        await waitFor(() => document.querySelectorAll('#recentList .proj-card').length > 0, 6000);
        out.card = (document.querySelector('#recentList .proj-card') || {}).textContent || '';
        const reopen = [...document.querySelectorAll('#toast button')].find(b => /reopen/i.test(b.textContent));
        out.reopenOffered = !!reopen;
        if (reopen) { reopen.click(); await waitFor(() => S().tray.length === out.pages, 8000); await shown(0); }
        out.reopened = S().tray.length === out.pages && document.body.classList.contains('step-3') && $('nameInput').value === out.name;
        return out;`);
      await page.waitForTimeout(800);
      ok('Finish saves the PDF, closes the project and keeps it under Recent projects; Reopen brings it back',
        /saves this PDF/.test(r.note) && r.closed && /Finished/.test(r.toast) && downloads.length === 1 && downloads[0] === r.name + '.pdf' && /finished/i.test(r.card) && r.reopenOffered && r.reopened, Object.assign({ downloads: downloads.slice() }, r));
      r = await evalIn(page, `
        $('btnPreviewFinal').click();
        await waitFor(() => $('studioDialog').open && $('btnFinish') && document.querySelector('#finalPages canvas'), 15000);
        $('savePreview').click(); await wait(700);
        const note = $('finishNote').textContent;
        $('btnFinish').click();
        await waitFor(() => S().docs.length === 0, 10000); await wait(600);
        return { note, closed: S().docs.length === 0 };`);
      await page.waitForTimeout(800);
      ok('after Save PDF the note says so, and Finish just closes (no second download)', r.closed && /was saved/.test(r.note) && downloads.length === 2, Object.assign({ downloads: downloads.slice() }, r));
      r = await evalIn(page, `
        await makePdf('Two Docs.pdf', 3); $('btnAddEverything').click(); await shown(0);
        $('btnNewOutput').click(); await wait(500);
        document.querySelectorAll('#docList .page-card')[1].click(); await wait(100); $('btnPickAdd').click(); await shown(0);
        const sel = $('outputSelect'); sel.value = sel.options[0].value; sel.dispatchEvent(new Event('change')); await shown(0);
        $('btnPreviewFinal').click();
        await waitFor(() => $('studioDialog').open && $('btnFinish') && document.querySelector('#finalPages canvas'), 15000);
        const out = { note: $('finishNote').textContent };
        $('btnFinish').click(); await wait(1500);
        out.stillOpen = S().docs.length === 1; out.second = $('outputSelect').selectedIndex === 1 && S().tray.length === 1;
        $('btnPreviewFinal').click();
        await waitFor(() => $('studioDialog').open && $('btnFinish') && document.querySelector('#finalPages canvas'), 15000);
        out.note2 = $('finishNote').textContent;
        $('btnFinish').click(); await waitFor(() => S().docs.length === 0, 10000); await wait(600);
        out.closed = S().docs.length === 0;
        return out;`);
      await page.waitForTimeout(800);
      ok('two new PDFs in a project: Finish saves the first and opens the second; Finish on the last closes it',
        /opens the next one/.test(r.note) && r.stillOpen && r.second && /closes the project/.test(r.note2) && r.closed && downloads.length === 4 && downloads[2] === 'Two Docs.pdf' && downloads[3] === 'New PDF 2.pdf', Object.assign({ downloads: downloads.slice() }, r));
      // Gmail draft → Finish in its success message: closes without saving again (gateway mocked — nothing is sent)
      let posted = null;
      await page.route('https://script.google.com/macros/s/SMOKE-TEST/**', route => {
        try { posted = JSON.parse(route.request().postData() || '{}'); } catch (_) {}
        route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, attached: 1, remainingQuota: 99 }) });
      });
      r = await evalIn(page, `
        localStorage.setItem('bliMailGateway.url', 'https://script.google.com/macros/s/SMOKE-TEST/exec'); localStorage.setItem('bliMailGateway.secret', 'smoke');
        await makePdf('Mail Me.pdf', 1); $('btnAddEverything').click(); await shown(0);
        $('btnEmail').click(); await wait(300);
        $('mailTo').value = 'test@example.com';
        $('btnEmailGo').click();
        await waitFor(() => $('mailBanner').classList.contains('ok') && $('mailBanner').querySelector('.finish-button'), 15000);
        const out = { banner: $('mailBanner').textContent };
        $('mailBanner').querySelector('.finish-button').click();
        await waitFor(() => S().docs.length === 0, 10000); await wait(500);
        out.closed = S().docs.length === 0 && !$('emailModal').classList.contains('open');
        localStorage.removeItem('bliMailGateway.url'); localStorage.removeItem('bliMailGateway.secret');
        return out;`);
      await page.unroute('https://script.google.com/macros/s/SMOKE-TEST/**');
      await page.waitForTimeout(600);
      ok('Gmail draft → Finish in its success message closes the project, no extra download (gateway mocked)', /Draft created/.test(r.banner) && r.closed && downloads.length === 4, Object.assign({ downloads: downloads.slice() }, r));
      // the body the gateway turns into the Gmail draft: the Gold Elite v2 / core structure v3 gate (Bill, 2026-10-01)
      {
        const html = (posted && posted.html) || '';
        const count = s => html.split(s).length - 1;
        const g = {
          courier: count('font:15px courier'), pngSpacer: count('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQ'),
          pairedWidth: count('style="width:100%;max-width:600px'), nowrap: count('white-space:nowrap'),
          fluid: html.includes('width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:600px;margin:0 auto"'),
          fixed600: /<table[^>]*class="email-container"[^>]*>/.test(html) && /width="600"/.test(html.match(/<table[^>]*class="email-container"[^>]*>/)[0]),
          firstInBody: /<body[^>]*>\s*<div style="display:none;white-space:nowrap;font:15px courier[^>]*>[^<]*<\/div>\s*<img src="data:image\/png;base64,iVBOR/.test(html),
          darkGoldOnLight: html.includes('color:#8a6d2f'), placeholders: count('{{'), ascii: /^[\x00-\x7F]*$/.test(html), size: html.length,
          attachment: !!(posted && posted.attachments && posted.attachments.length === 1 && /\.pdf$/.test(posted.attachments[0].name))
        };
        ok('the Gmail draft body keeps the Gold Elite v2 skeleton: spacer line + 600 px image first, fluid container, one nowrap, ASCII',
          g.courier === 1 && g.pngSpacer === 1 && g.pairedWidth === 0 && g.nowrap === 1 && g.fluid && !g.fixed600 && g.firstInBody && g.darkGoldOnLight &&
          g.placeholders === 0 && g.ascii && g.size < 102400 && g.attachment, g);
      }
      page.off('download', onDl);
    }

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
