/**
 * Screenshots of PDF Studio for visual review — LOOK at the screens, do not
 * only measure them. (Measuring found the numbers; looking found the centered
 * sidebar labels, the page cards that did not fill their column, the delete
 * handle drawn as a tall pill and the dialogs stuck in the top-left corner.)
 *
 *   node shots.js              every size into ./shots/ (git-ignored)
 *   node shots.js phone        one size only: desktop | laptop | tablet | phone
 *                              (comma separated for several)
 *   PDF_STUDIO_URL=https://www.billlayneinsurance.com/pdf-tools/ node shots.js
 *
 * Needs the dev server on :8080 (python -m http.server 8080 from the repo root)
 * unless a URL is given. Uses the Chrome or Edge already installed. The "saved
 * projects" it creates live only in the throwaway browser context.
 *
 * desktop 1586x992 and laptop 1366x768 show the all-in-one workspace (pages |
 * live page | tools); tablet 820x1100 and phone 390x844 show the same markup
 * stacked, with the full-screen editor.
 */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.PDF_STUDIO_URL || 'http://localhost:8080/pdf-tools/';
const which = (process.argv[2] || 'all').split(',');
const want = k => which.includes('all') || which.includes(k);

// in-page helper: a believable multi-page PDF with a letterhead band
const seed = `
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const P = window.PDFStudio;
  const mk = async (name, pages, title) => {
    const d = await PDFLib.PDFDocument.create();
    const font = await d.embedFont(PDFLib.StandardFonts.HelveticaBold);
    for (let i = 1; i <= pages; i++) {
      const pg = d.addPage([612, 792]);
      pg.drawRectangle({ x: 0, y: 722, width: 612, height: 70, color: PDFLib.rgb(0.06, 0.16, 0.32) });
      pg.drawText('BILL LAYNE INSURANCE', { x: 40, y: 750, size: 20, font, color: PDFLib.rgb(1, 1, 1) });
      pg.drawText(title + (pages > 1 ? '  -  page ' + i : ''), { x: 40, y: 660, size: 30, font, color: PDFLib.rgb(0.05, 0.1, 0.2) });
      for (let k = 0; k < 14; k++) pg.drawRectangle({ x: 40, y: 600 - k * 34, width: 300 + ((k * 53) % 220), height: 10, color: PDFLib.rgb(0.82, 0.85, 0.9) });
    }
    await P.addPdfData(name, new Uint8Array(await d.save()));
    await wait(350);
  };
`;
const run = (page, body) => page.evaluate(new Function('return (async () => {' + seed + body + '})()'));

(async () => {
  let browser;
  for (const channel of ['chrome', 'msedge']) { try { browser = await chromium.launch({ channel, headless: true }); break; } catch (_) {} }
  if (!browser) browser = await chromium.launch({ headless: true });

  const shot = async (page, name) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('saved shots/' + name + '.png');
  };
  const open = async (w, h) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(URL + '?v=' + Date.now(), { waitUntil: 'load' });
    await page.waitForFunction(() => window.PDFStudio && window.PDFLib, null, { timeout: 20000 });
    await page.waitForTimeout(500);
    return { ctx, page };
  };
  const pageDrawn = page => page.waitForFunction(() => { const s = window.PDFStudio.getState(); return s.current >= 0 && !s.loading && document.getElementById('editCanvas').width > 100; }, null, { timeout: 20000 });
  // three saved projects so the "Recent projects" cards have something real to show
  const saveProjects = async (page) => {
    for (const [name, pages, title] of [['Home Quote Packet', 4, 'Homeowners Insurance Quote'], ['Auto Application', 3, 'Auto Insurance Application'], ['Policy Documents', 5, 'Policy Documents']]) {
      await run(page, `
        await mk(${JSON.stringify(name + '.pdf')}, ${pages}, ${JSON.stringify(title)});
        P.addAllToTray(); await wait(300);
        document.getElementById('btnWsBack').click(); await wait(250);
        document.getElementById('closeProjectName').value = ${JSON.stringify(name)};
        document.getElementById('saveAndClose').click(); await wait(900);`);
    }
    await page.waitForTimeout(3400);   // let the "Saved as…" toast leave the frame
  };
  const files = `await mk('Smith Home Policy.pdf', 4, 'Homeowners Policy'); await mk('Smith Auto ID Cards.pdf', 2, 'Auto ID Cards');`;

  // the workspace: source files with nothing chosen yet, the pages, an edit, the Source files tab, Preview & finish
  const workspace = async (page, prefix) => {
    await run(page, files);
    await shot(page, prefix + '-3-source-files');
    await page.click('#btnAddEverything');
    await pageDrawn(page);
    await page.waitForTimeout(3400);
    await shot(page, prefix + '-4-pages');
    await run(page, `
      document.getElementById('modeText').click(); await wait(150);
      document.getElementById('stampText').value = 'Prepared for your review';
      const ov = document.getElementById('editOverlay'), r = ov.getBoundingClientRect();
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + r.width * .3, clientY: r.top + r.height * .82 }));
      await wait(1500);`);
    await shot(page, prefix + '-5-text-added');
    await page.click('#wsTabSources');
    await shot(page, prefix + '-6-source-files-tab');
    await page.click('#wsTabPages');
    await page.click('#btnPreviewFinal');
    await page.waitForFunction(() => document.getElementById('studioDialog').open && document.querySelector('#finalPages canvas'), null, { timeout: 20000 });
    await shot(page, prefix + '-7-preview-and-finish');
  };
  // narrower than three panes: the pages, the full-screen editor, the source files
  const stacked = async (page, prefix) => {
    await run(page, files);
    await page.click('#btnAddEverything');
    await page.waitForTimeout(3600);
    await shot(page, prefix + '-2-pages');
    await page.locator('#trayStrip .tray-card').first().click({ position: { x: 60, y: 90 } });
    await pageDrawn(page);
    await shot(page, prefix + '-3-editor');
    await page.click('#btnEditDone');
    await page.click('#wsTabSources');
    await shot(page, prefix + '-4-source-files');
  };

  if (want('desktop')) {
    const { ctx, page } = await open(1586, 992);
    await shot(page, 'desktop-1-home-empty');
    await saveProjects(page);
    await shot(page, 'desktop-2-home-projects');
    await workspace(page, 'desktop');
    await ctx.close();
  }
  if (want('laptop')) {
    const { ctx, page } = await open(1366, 768);
    await shot(page, 'laptop-1-home');
    await workspace(page, 'laptop');
    await ctx.close();
  }
  if (want('tablet')) {
    const { ctx, page } = await open(820, 1100);
    await shot(page, 'tablet-1-home');
    await stacked(page, 'tablet');
    await ctx.close();
  }
  if (want('phone')) {
    const { ctx, page } = await open(390, 844);
    await shot(page, 'phone-1-home-empty');
    await stacked(page, 'phone');
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
