/**
 * Mail Gateway smoke test - the safety rules of /mail-gateway/ (sender page,
 * Mail Studio, Receipt Builder and the drop-in gateway-client.js).
 *
 *   tools\test-mail-gateway.bat        (from the repo root)
 *   node tools/mail-gateway-tests/smoke.js
 *
 * Serves the local copy of mail-gateway/ and a MOCK gateway that only records
 * what it is sent. Nothing here talks to Google, creates a draft or sends an
 * email, and only made-up addresses are used. Drives the Chrome (or Edge)
 * already installed on the machine through the playwright-core that the PDF
 * Studio tests install (tools/pdf-studio-tests).
 *
 * What it protects (all three were real findings on 2026-11-26):
 *   1. A setup link (#gw=) can never repoint the gateway or leak the secret:
 *      both values or nothing, a Google script address or nothing, and a Yes
 *      from the person before anything is saved or contacted.
 *   2. The recipient and attachments of one email never ride along into the
 *      next one unnoticed.
 *   3. "Click again to draft anyway" works.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
let chromium;
try { ({ chromium } = require(path.join(__dirname, '..', 'pdf-studio-tests', 'node_modules', 'playwright-core'))); }
catch (_) { ({ chromium } = require('playwright-core')); }

// MG_DIR lets the suite be pointed at another copy of the folder (used once to prove
// that each check really fails when its fix is taken out).
const DIR = process.env.MG_DIR ? path.resolve(process.env.MG_DIR) : path.resolve(__dirname, '..', '..', 'mail-gateway');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const results = [];
const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? '  PASS ' : '  FAIL ') + name + (!pass && info !== undefined ? '  -> ' + JSON.stringify(info) : '')); };
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const gwLink = (obj) => '#gw=' + b64url(JSON.stringify(obj));
const email = (who) => `<!-- SUBJECT: welcome ${who} -->\n<!doctype html><html><body><table width="600"><tr><td>Welcome, ${who}.</td></tr></table></body></html>`;

/* ---------- local pages + mock gateway ---------- */
const log = [];
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/mock/')) {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let j = {}; try { j = JSON.parse(body); } catch (_) {}
      log.push({ endpoint: url.pathname, secret: j.secret || null, mode: j.mode || null, to: j.to || '', subject: j.subject || '', files: (j.attachments || []).map(a => a.name) });
      res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
      if (j.mode === 'ping') return res.end(JSON.stringify({ ok: true, mode: 'ping', version: 'mock', remainingQuota: 1499 }));
      res.end(JSON.stringify({ ok: true, mode: j.mode || 'draft', version: 'mock', to: j.to || '', subject: j.subject || '', attached: (j.attachments || []).length, messageId: 'mock1', remainingQuota: 1498 }));
    });
    return;
  }
  if (url.pathname === '/mail-gateway/_client-test.html') {
    res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
    return res.end('<!doctype html><html><body><h1>client test</h1><script src="gateway-client.js"></script></body></html>');
  }
  const rel = url.pathname.replace(/^\/mail-gateway\/?/, '') || 'index.html';
  const file = path.join(DIR, rel);
  if (!url.pathname.startsWith('/mail-gateway') || !file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

async function launch() {
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel, headless: true }); } catch (_) {}
  }
  return chromium.launch({ headless: true });
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const REAL = base + '/mock/real', OTHER = base + '/mock/other', EVIL = base + '/mock/evil';
  const browser = await launch();
  const sent = (endpoint) => log.filter(x => x.endpoint === endpoint);

  // A fresh browser profile with (optionally) a gateway already saved.
  async function fresh(saved) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    let outside = 0;   // any request that leaves this computer for a made-up host
    await page.route(/evil\.example/, r => { outside++; r.abort(); });
    if (saved) {
      await page.goto(base + '/mail-gateway/_client-test.html?seed', { waitUntil: 'load' });
      await page.evaluate(([u, s]) => { localStorage.setItem('bliMailGateway.url', u); localStorage.setItem('bliMailGateway.secret', s); }, [saved.url, saved.secret]);
    }
    const open = async (file, hash) => { await page.goto(base + '/mail-gateway/' + (file || '') + '?t=' + Date.now() + Math.random() + (hash || ''), { waitUntil: 'load' }); await page.waitForTimeout(700); };
    const saved2 = () => page.evaluate(() => ({ url: localStorage.getItem('bliMailGateway.url'), secret: localStorage.getItem('bliMailGateway.secret') }));
    return { ctx, page, errors, open, saved: saved2, outside: () => outside };
  }
  const loadEmail = async (page, who) => {
    await page.setInputFiles('#fileInput', { name: `${who}.html`, mimeType: 'text/html', buffer: Buffer.from(email(who)) });
    await page.waitForFunction((w) => document.getElementById('htmlInput').value.includes('Welcome, ' + w), who);
    await page.waitForTimeout(150);
  };
  const attach = async (page, name) => {
    await page.setInputFiles('#attachInput', { name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 ' + name) });
    await page.waitForFunction((n) => [...document.querySelectorAll('#attachList .att-name')].some(x => x.textContent.includes(n)), name);
  };
  const state = (page) => page.evaluate(() => ({
    to: document.getElementById('toInput').value, cc: document.getElementById('ccInput').value,
    files: [...document.querySelectorAll('#attachList .att-name')].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
    carry: document.getElementById('carryNote').className, carryText: document.getElementById('carryNote').textContent,
    result: document.getElementById('result').textContent, draft: document.getElementById('draftBtn').textContent.trim(), send: document.getElementById('sendBtn').textContent.trim(),
    setup: document.getElementById('setupAsk').className, setupText: document.getElementById('setupAsk').textContent, badge: document.getElementById('connBadge').textContent,
  }));
  const SETTINGS = { url: REAL, secret: 'dummy-secret-123' };

  try {
    /* ===== 1. setup links ===== */
    {
      const t = await fresh(SETTINGS); log.length = 0;
      await t.open('', gwLink({ u: EVIL }));
      const s = await t.saved(), st = await state(t.page);
      ok('a setup link that carries only an address changes nothing and contacts nobody', s.url === REAL && s.secret === 'dummy-secret-123' && !sent('/mock/evil').length && /ask-card show err/.test(st.setup) && /ignored/.test(st.setupText), { s, evil: sent('/mock/evil'), st: st.setupText });
      ok('...and the link is removed from the address bar', !(await t.page.evaluate(() => location.hash)));
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS); log.length = 0;
      await t.open('', gwLink({ u: 'https://evil.example/macros/s/abc/exec', s: 'x' }));
      const s = await t.saved();
      ok('a setup link to an address that is not a Google script is refused, even with a secret in it', s.url === REAL && s.secret === 'dummy-secret-123' && t.outside() === 0, { s, outside: t.outside() });
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS); log.length = 0;
      await t.open('', gwLink({ u: OTHER, s: 'other-secret' }));
      let s = await t.saved(), st = await state(t.page);
      ok('a complete setup link ASKS first: nothing saved and nothing contacted until the answer', s.url === REAL && !sent('/mock/other').length && /REPLACE/.test(st.setupText) && /ask-card show$/.test(st.setup), { s, st: st.setupText });
      ok('...while it waits the page still talks only to the gateway that was saved', sent('/mock/real').every(x => x.secret === 'dummy-secret-123') && log.every(x => x.endpoint === '/mock/real'), log);
      await t.page.click('#setupNo');
      s = await t.saved();
      ok('No keeps the saved gateway', s.url === REAL && s.secret === 'dummy-secret-123' && !sent('/mock/other').length, s);
      await t.open('', gwLink({ u: OTHER, s: 'other-secret' }));
      await t.page.click('#setupYes'); await t.page.waitForTimeout(700);
      s = await t.saved(); st = await state(t.page);
      ok('Yes saves the new gateway and checks it', s.url === OTHER && s.secret === 'other-secret' && sent('/mock/other').some(x => x.mode === 'ping' && x.secret === 'other-secret') && /connected/.test(st.badge), { s, badge: st.badge });
      await t.open('', gwLink({ u: OTHER, s: 'other-secret' }));
      st = await state(t.page);
      ok('the same link again only says "already connected"', /already connected/.test(st.setupText), st.setupText);
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS); log.length = 0;
      await t.open('');
      await t.page.click('#toggleSettingsBtn');
      await t.page.fill('#gwUrl', 'https://evil.example/exec');
      await t.page.click('#saveSettings'); await t.page.waitForTimeout(300);
      const s = await t.saved(), st = await state(t.page);
      ok('typing a non-Google address into Settings is refused and nothing is posted to it', s.url === REAL && t.outside() === 0 && /Google Apps Script/.test(st.result), { s, result: st.result });
      await t.ctx.close();
    }
    {
      // the address rule itself (taken from the page source, so the test cannot drift from it)
      const src = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
      const re = new RegExp(/var GW_URL_RE = \/(.+)\/;/.exec(src)[1]);
      const good = ['https://script.google.com/macros/s/AKfycbx_abc-123/exec', 'https://script.google.com/a/macros/billlayneinsurance.com/s/AKfycbx_abc-123/exec'];
      const bad = ['http://script.google.com/macros/s/abc/exec', 'https://script.google.com.evil.example/macros/s/abc/exec', 'https://evil.example/macros/s/abc/exec',
        'https://script.google.com@evil.example/macros/s/abc/exec', 'https://script.google.com/macros/s/abc/exec?next=https://evil.example', 'https://script.google.com/macros/s/abc/dev',
        'https://script.google.com/macros/s/abc/exec/../x', 'https://docs.google.com/macros/s/abc/exec', 'javascript:alert(1)//script.google.com/macros/s/abc/exec', ''];
      ok('the address rule accepts the two Google web app forms and rejects look-alikes', good.every(u => re.test(u)) && bad.every(u => !re.test(u)), { good: good.map(u => re.test(u)), bad: bad.map(u => re.test(u)) });
      for (const f of ['studio.html', 'receipt.html', 'gateway-client.js']) {
        const same = new RegExp(/var GW_URL_RE = \/(.+)\/;/.exec(fs.readFileSync(path.join(DIR, f), 'utf8'))[1]).source === re.source;
        ok('...and ' + f + ' uses the same rule', same);
      }
    }
    {
      // a saved address that is not the gateway (older browser, tampering) is never posted to
      const t = await fresh({ url: 'https://evil.example/exec', secret: 'dummy-secret-123' }); log.length = 0;
      for (const f of ['', 'studio.html', 'receipt.html']) {
        await t.open(f);
        const badge = await t.page.evaluate(() => document.getElementById('connBadge').textContent);
        ok((f || 'sender page') + ': a saved address that is not the gateway is flagged, not contacted', /check the URL/.test(badge) && t.outside() === 0, { badge, outside: t.outside() });
      }
      ok('...and none of the three pages threw an error', !t.errors.length, t.errors);
      await t.ctx.close();
    }

    /* ===== 2. "draft anyway" and the Send confirmations ===== */
    {
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await t.page.fill('#htmlInput', '<!-- SUBJECT: your auto quote -->\n<!doctype html><html><body><table width="600"><tr><td>Hi {{FIRST_NAME}}.</td></tr></table></body></html>');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(300);
      let st = await state(t.page);
      ok('an unfilled blank stops the draft and arms "draft anyway"', /draft anyway/.test(st.draft) && !log.some(x => x.mode === 'draft'), st.draft);
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      st = await state(t.page);
      ok('the second click on "draft anyway" creates the draft (it used to do nothing)', log.filter(x => x.mode === 'draft').length === 1 && /Draft created/.test(st.result), { drafts: log.filter(x => x.mode === 'draft').length, result: st.result });

      log.length = 0;
      await t.page.fill('#toInput', 'customer-a@example.invalid');
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(200);
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(200);
      st = await state(t.page);
      ok('"send anyway" still needs its own second confirmation', !log.some(x => x.mode === 'send') && /Click again to send to customer-a@example\.invalid/.test(st.send), st.send);
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(300);
      st = await state(t.page);
      ok('clicking Draft cancels an armed Send', !/Click again to send/.test(st.send) && !log.some(x => x.mode === 'send'), st.send);
      await t.ctx.close();
    }

    /* ===== 3. leftovers from the email before ===== */
    {
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await loadEmail(t.page, 'customer A');
      await t.page.fill('#toInput', 'customer-a@example.invalid');
      await attach(t.page, 'customer-A-dec-page.pdf');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('first email: draft goes out with its own recipient and file', log.length === 1 && log[0].to === 'customer-a@example.invalid' && log[0].files.join() === 'customer-A-dec-page.pdf', log);
      await loadEmail(t.page, 'customer B');
      let st = await state(t.page);
      ok('loading the NEXT email clears the last recipient and attachment, and says so', st.to === '' && !st.files.length && /ask-card show ok/.test(st.carry) && /customer-a@example\.invalid/.test(st.carryText) && /customer-A-dec-page\.pdf/.test(st.carryText), st);
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('...so the next draft carries nothing from the customer before', log.length === 2 && log[1].to === '' && !log[1].files.length && /customer B/.test(log[1].subject), log[1]);
      await loadEmail(t.page, 'customer A again');
      await t.page.fill('#toInput', 'customer-a@example.invalid'); await attach(t.page, 'customer-A-dec-page.pdf');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      await loadEmail(t.page, 'customer A corrected');
      await t.page.click('#carryUndo');
      st = await state(t.page);
      ok('"Put them back" restores the recipient and file for a corrected copy of the same email', st.to === 'customer-a@example.invalid' && st.files.length === 1 && !/show/.test(st.carry), st);
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await t.page.fill('#toInput', 'customer-a@example.invalid');
      await attach(t.page, 'customer-A-dec-page.pdf');
      await loadEmail(t.page, 'customer B');          // nothing was created for A: its details may or may not belong here
      let st = await state(t.page);
      ok('leftovers that were never sent are KEPT but a yes/no is owed', st.to === 'customer-a@example.invalid' && st.files.length === 1 && /ask-card show$/.test(st.carry) && /Check before you continue/.test(st.carryText), st);
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(400);
      st = await state(t.page);
      ok('...Draft is blocked until it is answered', !log.length && /NOT CREATED/.test(st.result), st.result);
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(200); await t.page.click('#sendBtn'); await t.page.waitForTimeout(400);
      st = await state(t.page);
      ok('...and so is Send Now', !log.length && /NOT SENT/.test(st.result), st.result);
      await t.page.click('#carryClear');
      st = await state(t.page);
      ok('"No, clear them" empties the recipient and attachments', st.to === '' && !st.files.length && !/show/.test(st.carry), st);
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('...and then the draft goes through clean', log.length === 1 && log[0].to === '' && !log[0].files.length, log);

      await t.open(''); log.length = 0;
      await t.page.fill('#toInput', 'customer-b@example.invalid');     // typed the address first, then loaded the email
      await loadEmail(t.page, 'customer B');
      await t.page.click('#carryKeep');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('"Yes, keep them" lets the email go to the address that was typed first', log.length === 1 && log[0].to === 'customer-b@example.invalid', log);
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await loadEmail(t.page, 'customer A'); await t.page.fill('#toInput', 'customer-a@example.invalid'); await attach(t.page, 'customer-A-dec-page.pdf');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      await t.page.evaluate((html) => {             // customer C's email and PDF dropped on the page together
        const dt = new DataTransfer();
        dt.items.add(new File([html], 'customer C.html', { type: 'text/html' }));
        dt.items.add(new File(['%PDF-1.4 C'], 'customer-C-dec-page.pdf', { type: 'application/pdf' }));
        window.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      }, email('customer C'));
      await t.page.waitForFunction(() => document.getElementById('htmlInput').value.includes('Welcome, customer C'));
      await t.page.waitForTimeout(400);
      const st = await state(t.page);
      ok('an email dropped together with its PDF keeps that PDF and drops the old one', st.files.length === 1 && /customer-C-dec-page\.pdf/.test(st.files[0]) && st.to === '', st);
      await t.ctx.close();
    }
    {
      // Ctrl+A, Ctrl+V of a whole new email straight into the code box is a new email too
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await loadEmail(t.page, 'customer A'); await t.page.fill('#toInput', 'customer-a@example.invalid'); await attach(t.page, 'customer-A-dec-page.pdf');
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      const paste = (html, wholeBox) => t.page.evaluate(([h, whole]) => {
        const el = document.getElementById('htmlInput');
        el.focus();
        if (whole) el.setSelectionRange(0, el.value.length); else el.setSelectionRange(el.value.length, el.value.length);
        const dt = new DataTransfer(); dt.setData('text', h);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        el.value = whole ? h : el.value + h;          // what the browser itself does after the event
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, [html, wholeBox]);
      await paste(email('customer E'), true);
      await t.page.waitForTimeout(300);
      let st = await state(t.page);
      ok('a whole email pasted over the code box clears the last recipient and attachment too', st.to === '' && !st.files.length && /ask-card show ok/.test(st.carry), st);
      await t.page.fill('#toInput', 'customer-e@example.invalid');
      await paste('<p>one more line</p>', false);
      await t.page.waitForTimeout(300);
      st = await state(t.page);
      ok('...but a small edit pasted into the code leaves the recipient alone', st.to === 'customer-e@example.invalid', st);
      await t.ctx.close();
    }

    /* ===== 4. Send Now ===== */
    {
      const t = await fresh(SETTINGS);
      await t.open(''); log.length = 0;
      await loadEmail(t.page, 'customer A'); await t.page.fill('#toInput', 'customer-a@example.invalid'); await attach(t.page, 'customer-A-dec-page.pdf');
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(200);
      let st = await state(t.page);
      ok('the armed Send button names the recipient and counts the files', /send to customer-a@example\.invalid \(\+1 file\)/.test(st.send) && /customer-A-dec-page\.pdf/.test(st.result) && !log.length, { send: st.send, result: st.result });
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(700);
      st = await state(t.page);
      ok('the second click sends once', log.filter(x => x.mode === 'send').length === 1 && /SENT/.test(st.result), log);
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(200);
      st = await state(t.page);
      ok('sending the very same email again is called out as a SECOND copy', /SECOND copy/.test(st.send) && /already sent/.test(st.result) && log.filter(x => x.mode === 'send').length === 1, { send: st.send, result: st.result });
      await t.ctx.close();
    }

    /* ===== 5. things that must keep working ===== */
    {
      const t = await fresh(SETTINGS);
      const payload = b64url(zlib.deflateRawSync(Buffer.from(JSON.stringify({ v: 1, name: 'Welcome - customer D', subject: 'welcome customer D', to: 'customer-d@example.invalid', cc: '', html: email('customer D') }))));
      await t.open('', '#z=' + payload); log.length = 0;
      await t.page.waitForFunction(() => document.getElementById('htmlInput').value.includes('Welcome, customer D'));
      const st = await state(t.page);
      const subject = await t.page.evaluate(() => document.getElementById('subjectInput').value);
      ok('a hand-off link (#z=) still loads the email, its recipient and subject, with no questions', st.to === 'customer-d@example.invalid' && subject === 'welcome customer D' && !/show/.test(st.carry), { st, subject });
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('...and drafts it', log.length === 1 && log[0].mode === 'draft' && log[0].to === 'customer-d@example.invalid', log);
      ok('the sender page ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS); log.length = 0;
      for (const f of ['studio.html', 'receipt.html']) {
        await t.open(f); await t.page.waitForTimeout(600);
        const badge = await t.page.evaluate(() => document.getElementById('connBadge').textContent);
        ok(f + ' still connects to a saved gateway', /connected/.test(badge), badge);
      }
      ok('Mail Studio and Receipt Builder ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }

    /* ===== 6. the drop-in client other tools copy ===== */
    {
      const t = await fresh(SETTINGS); log.length = 0;
      await t.open('_client-test.html', gwLink({ u: EVIL }));
      let s = await t.saved();
      ok('gateway-client.js: a link with only an address is ignored without a word', s.url === REAL && !(await t.page.$('#bliGwSetupAsk')), s);
      await t.open('_client-test.html', gwLink({ u: OTHER, s: 'other-secret' }));
      s = await t.saved();
      ok('gateway-client.js: a complete link asks first', s.url === REAL && !!(await t.page.$('#bliGwSetupAsk')), s);
      await t.page.click('#bliGwSetupNo');
      ok('gateway-client.js: No keeps the saved gateway', (await t.saved()).url === REAL && !(await t.page.$('#bliGwSetupAsk')));
      await t.page.evaluate((h) => { location.hash = h; }, gwLink({ u: OTHER, s: 'other-secret' }));   // also arrives without a page load
      await t.page.waitForSelector('#bliGwSetupAsk');
      await t.page.click('#bliGwSetupYes');
      s = await t.saved();
      ok('gateway-client.js: Yes saves it', s.url === OTHER && s.secret === 'other-secret', s);
      const r = await t.page.evaluate(async () => { try { const d = await window.bliMail({ mode: 'draft', subject: 'client test', html: '<p>hello</p>' }); return { ok: d.ok, mode: d.mode }; } catch (e) { return { error: e.message }; } });
      ok('gateway-client.js: bliMail still creates a draft through a proper gateway', r.ok === true && sent('/mock/other').some(x => x.mode === 'draft'), r);
      await t.page.evaluate(() => localStorage.setItem('bliMailGateway.url', 'https://evil.example/exec'));
      const r2 = await t.page.evaluate(async () => { try { await window.bliMail({ mode: 'draft', html: '<p>x</p>' }); return { sent: true }; } catch (e) { return { error: e.message }; } });
      ok('gateway-client.js: bliMail refuses to post the secret to anything else', /Google Apps Script/.test(r2.error || '') && t.outside() === 0, r2);
      ok('gateway-client.js ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
  } catch (e) {
    ok('the test run itself finished', false, String(e && e.stack || e).slice(0, 600));
  }

  await browser.close();
  server.close();
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (failed.length ? 'FAILED ' + failed.length + ' of ' : 'PASS: all ') + results.length + ' checks');
  process.exit(failed.length ? 1 : 0);
})();
