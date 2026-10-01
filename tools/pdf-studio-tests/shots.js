/**
 * Screenshots of PDF Studio for visual review — LOOK at the screens, do not
 * only measure them. (Measuring found the numbers; looking found the centered
 * sidebar labels, the off-center line and the button stretched over its hint.)
 *
 *   node shots.js              desktop + tablet + phone into ./shots/ (git-ignored)
 *   node shots.js phone        one size only (desktop | tablet | phone, comma separated)
 *   PDF_STUDIO_URL=https://www.billlayneinsurance.com/pdf-tools/ node shots.js
 *
 * Needs the dev server on :8080 (python -m http.server 8080 from the repo root)
 * unless a URL is given. Uses the Chrome or Edge already installed. The three
 * "saved projects" it creates live only in the throwaway browser context.
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
    await page.waitForTimeout(350);
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
  // three saved projects so the "Recent projects" cards have something real to show
  const saveProjects = async (page) => {
    for (const [name, pages, title] of [['Home Quote Packet', 4, 'Homeowners Insurance Quote'], ['Auto Application', 3, 'Auto Insurance Application'], ['Policy Documents', 5, 'Policy Documents']]) {
      await run(page, `
        await mk(${JSON.stringify(name + '.pdf')}, ${pages}, ${JSON.stringify(title)});
        P.addAllToTray(); await wait(300);
        document.getElementById('btnProjects').click(); await wait(250);
        document.getElementById('projectNameInput').value = ${JSON.stringify(name)};
        document.getElementById('saveProjectNow').click(); await wait(700);
        document.getElementById('studioDialogClose').click(); await wait(150);
        document.getElementById('btnReset').click(); await wait(250);
        document.getElementById('confirmReset').click(); await wait(600);`);
    }
    await page.waitForTimeout(3200);   // let the "Workspace cleared" toast leave the frame
  };
  const working = async (page, prefix, files) => {
    await run(page, files);
    await shot(page, prefix + '-choose-pages');
    await page.evaluate(() => { document.getElementById('btnAddEverything').click(); });
    await page.waitForTimeout(3600);
    await shot(page, prefix + '-your-pdf');
  };

  if (want('desktop')) {
    const { ctx, page } = await open(1586, 992);
    await shot(page, 'desktop-1-home-empty');
    await saveProjects(page);
    await shot(page, 'desktop-2-home-projects');
    await working(page, 'desktop-3', `await mk('Smith Home Policy.pdf', 4, 'Homeowners Policy'); await mk('Smith Auto ID Cards.pdf', 2, 'Auto ID Cards');`);
    await ctx.close();
  }
  if (want('tablet')) {
    const { ctx, page } = await open(1024, 768);
    await shot(page, 'tablet-1-home');
    await working(page, 'tablet-2', `await mk('Smith Home Policy.pdf', 4, 'Homeowners Policy');`);
    await ctx.close();
  }
  if (want('phone')) {
    const { ctx, page } = await open(431, 912);
    await shot(page, 'phone-1-home-empty');
    await saveProjects(page);
    await shot(page, 'phone-2-home-projects');
    await working(page, 'phone-3', `await mk('Smith Home Policy.pdf', 4, 'Homeowners Policy');`);
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
