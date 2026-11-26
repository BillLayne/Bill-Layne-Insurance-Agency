/**
 * Mail Gateway smoke test - the mail pages on their own address (mail.billlayneinsurance.com):
 * Universal Sender, Mail Studio, Receipt Builder, the old-address bridge and gateway-client.js.
 *
 *   tools\test-mail-gateway.bat        (from the repo root; also runs the two Node-only tests)
 *   node tools/mail-gateway-tests/smoke.js
 *
 * Serves the local copy of mail-gateway/ exactly the way the Worker does (same route table
 * and the same security headers, from tools/mail-site/site-rules.mjs) plus a MOCK gateway that
 * only records what it is sent. Nothing here talks to Google, creates a draft or sends an
 * email, and only made-up addresses are used. Drives the Chrome (or Edge) already installed,
 * through the playwright-core that the PDF Studio tests install (tools/pdf-studio-tests).
 *
 *   MG_URL=http://127.0.0.1:8799   run the page checks against `wrangler dev` (the real Worker)
 *   MG_DIR=<folder>                point at another copy of mail-gateway/ (used to prove a
 *                                  check fails when its fix is taken out)
 *
 * What it protects:
 *   1. A setup link (#gw=) can never repoint the gateway or leak the key.
 *   2. One customer's recipient and attachments never ride into the next email unnoticed.
 *   3. "Click again to draft anyway" works.
 *   4. The new address serves only the mail pages, under a policy that lets nothing else run.
 *   5. The old address passes visitors on and offers ONE click to carry the connection across.
 *   6. Three keys: full (this page only), draft-only (every other tool), website (agency inbox).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pathToFileURL } = require('url');
let chromium;
try { ({ chromium } = require(path.join(__dirname, '..', 'pdf-studio-tests', 'node_modules', 'playwright-core'))); }
catch (_) { ({ chromium } = require('playwright-core')); }

const DIR = process.env.MG_DIR ? path.resolve(process.env.MG_DIR) : path.resolve(__dirname, '..', '..', 'mail-gateway');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const results = [];
const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? '  PASS ' : '  FAIL ') + name + (!pass && info !== undefined ? '  -> ' + JSON.stringify(info) : '')); };
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const gwLink = (obj) => '#gw=' + b64url(JSON.stringify(obj));
const email = (who) => `<!-- SUBJECT: welcome ${who} -->\n<!doctype html><html><body><table width="600"><tr><td>Welcome, ${who}.</td></tr></table></body></html>`;
const zLink = (who, to) => '#z=' + b64url(zlib.deflateRawSync(Buffer.from(JSON.stringify({ v: 1, name: 'Welcome - ' + who, subject: 'welcome ' + who, to: to, cc: '', html: email(who) }))));

/* ---------- the mock gateway ---------- */
const log = [];
const strictKeys = {};          // /mock/strict and /mock/old know only these keys: secret -> 'full' | 'draft' | 'agency'
function mockAnswer(endpoint, j) {
  const done = (scope) => Object.assign({ ok: true, mode: j.mode || 'draft', version: '1.4', to: j.to || '', subject: j.subject || '', attached: (j.attachments || []).length, messageId: 'mock1', remainingQuota: 1498 }, scope ? { scope } : {});
  if (endpoint === '/mock/strict' || endpoint === '/mock/old') {
    const scope = strictKeys[j.secret];
    if (!scope) return { ok: false, error: 'Unauthorized: bad or missing secret.' };
    const v14 = endpoint === '/mock/strict';
    if (j.mode === 'ping') return Object.assign({ ok: true, mode: 'ping', version: v14 ? '1.4' : '1.3', remainingQuota: 1499 }, v14 ? { scope } : {});
    if (j.mode === 'send' && scope === 'draft') return { ok: false, scope, error: 'This key can only create drafts. Nothing was sent.' };
    return done(v14 ? scope : '');
  }
  if (j.mode === 'ping') return { ok: true, mode: 'ping', version: 'mock', scope: 'full', remainingQuota: 1499 };
  return done('full');
}
function record(endpoint, body) {
  let j = {}; try { j = JSON.parse(body); } catch (_) {}
  log.push({ endpoint, secret: j.secret || null, mode: j.mode || null, to: j.to || '', subject: j.subject || '', files: (j.attachments || []).map(a => a.name) });
  return j;
}

(async () => {
  // MG_RULES points at another copy of the site rules (same purpose as MG_DIR: proving a check can fail)
  const rules = await import(pathToFileURL(process.env.MG_RULES ? path.resolve(process.env.MG_RULES) : path.resolve(__dirname, '..', 'mail-site', 'site-rules.mjs')).href);

  // The new address, served the way the Worker serves it (route table + headers from site-rules.mjs).
  function newSite(pathname, search, local) {
    const rule = rules.resolve(pathname);
    const head = (kind, extra) => Object.assign({ 'content-type': kind === 'html' ? TYPES['.html'] : kind === 'js' ? TYPES['.js'] : 'text/plain; charset=utf-8' }, rules.securityHeaders(kind, local), extra || {});
    if (rule.redirect) return { status: 301, headers: head('other', { location: rule.redirect + (search || '') }), body: 'Moved' };
    if (!rule.asset || !fs.existsSync(path.join(DIR, rule.asset))) return { status: 404, headers: head('other'), body: 'Not found' };
    return { status: 200, headers: head(rule.kind), body: fs.readFileSync(path.join(DIR, rule.asset)) };
  }
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/mock/')) {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        const j = record(url.pathname, body);
        res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
        res.end(JSON.stringify(mockAnswer(url.pathname, j)));
      });
      return;
    }
    if (url.pathname === '/_t/client.html') {          // a bare page that only loads the drop-in client
      res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
      return res.end('<!doctype html><html><body><h1>client test</h1><script src="gateway-client.js"></script></body></html>');
    }
    if (url.pathname === '/_t/gateway-client.js') {
      res.writeHead(200, { 'content-type': TYPES['.js'], 'cache-control': 'no-store' });
      return res.end(fs.readFileSync(path.join(DIR, 'gateway-client.js')));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, rules.securityHeaders('other', true)); return res.end('Method not allowed'); }
    const out = newSite(url.pathname, url.search, true);
    res.writeHead(out.status, out.headers);
    res.end(out.body);
  });
  // The OLD address: the same files under /mail-gateway/ the way the public website serves them (no policy).
  const oldServer = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let rel = url.pathname.replace(/^\/mail-gateway\/?/, '');
    if (!url.pathname.startsWith('/mail-gateway')) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<!doctype html><title>404</title>not found'); }
    if (!rel) rel = 'index.html'; else if (!path.extname(rel)) rel += '.html';
    const file = path.join(DIR, rel);
    if (!file.startsWith(DIR) || !fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<!doctype html><title>404</title>not found'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  await new Promise(r => oldServer.listen(0, '127.0.0.1', r));
  const mockBase = 'http://127.0.0.1:' + server.address().port;
  const base = (process.env.MG_URL || mockBase).replace(/\/+$/, '');           // where the pages are opened
  const REAL = mockBase + '/mock/real', OTHER = mockBase + '/mock/other', EVIL = mockBase + '/mock/evil', STRICT = mockBase + '/mock/strict', OLDGW = mockBase + '/mock/old';
  const OLD_ORIGIN = 'http://www.billlayneinsurance.com:' + oldServer.address().port;
  const OLD_SITE = OLD_ORIGIN + '/mail-gateway/';
  const NEW_SITE = 'https://mail.billlayneinsurance.com';
  const GOOGLE = 'https://script.google.com/macros/s/TEST-BRIDGE/exec';
  console.log('Mail Gateway smoke test - pages from ' + base + (process.env.MG_URL ? ' (the real Worker)' : ' (local copy, Worker rules)'));

  let browser;
  for (const channel of ['chrome', 'msedge', null]) {
    try { browser = await chromium.launch(Object.assign({ headless: true, args: ['--host-resolver-rules=MAP www.billlayneinsurance.com 127.0.0.1'] }, channel ? { channel } : {})); break; } catch (_) {}
  }
  const sent = (endpoint) => log.filter(x => x.endpoint === endpoint);
  const policyBreaks = [];        // anything a page logs because its own security policy blocked something
  const pageErrors = [];
  let siteHealth = { ok: true, connected: true, ready: true, scope: 'agency', version: '1.4' };

  // A fresh browser profile with (optionally) a gateway already saved on the page's address.
  async function fresh(saved) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    let outside = 0;   // any request that leaves this computer for a made-up host
    await ctx.route(/evil\.example/, r => { outside++; r.abort(); });
    await ctx.route(/^https:\/\/www\.billlayneinsurance\.com\/api\/accident-report/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(siteHealth) }));
    // the new address and the real Google host exist only inside the test
    await ctx.route(/^https:\/\/mail\.billlayneinsurance\.com\//, r => { const u = new URL(r.request().url()); const out = newSite(u.pathname, u.search, false); r.fulfill({ status: out.status, headers: out.headers, body: out.body }); });
    await ctx.route(GOOGLE, r => { const j = record('/google', r.request().postData() || '{}'); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(mockAnswer('/mock/real', j)) }); });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => { errors.push(e.message); pageErrors.push(e.message); });
    page.on('console', m => { const t = m.text(); if (/Content Security Policy|Content-Security-Policy/i.test(t)) policyBreaks.push(t.slice(0, 220)); });
    const seedOn = async (origin, s) => {
      await page.goto(origin + '/__seed-' + Date.now(), { waitUntil: 'load' });
      await page.evaluate(([u, k]) => { localStorage.setItem('bliMailGateway.url', u); localStorage.setItem('bliMailGateway.secret', k); }, [s.url, s.secret]);
    };
    if (saved) await seedOn(base, saved);
    const open = async (file, hash) => { await page.goto(base + '/' + (file || '') + '?t=' + Date.now() + Math.random() + (hash || ''), { waitUntil: 'load' }); await page.waitForTimeout(700); };
    const savedNow = () => page.evaluate(() => ({ url: localStorage.getItem('bliMailGateway.url'), secret: localStorage.getItem('bliMailGateway.secret'),
      draft: localStorage.getItem('bliMailGateway.draftSecret'), agency: localStorage.getItem('bliMailGateway.agencySecret'), moved: localStorage.getItem('bliMailGateway.movedAt') }));
    return { ctx, page, errors, open, seedOn, saved: savedNow, outside: () => outside };
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
    keys: document.getElementById('keysResult').textContent, keysCls: document.getElementById('keysResult').className,
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
      const src = fs.readFileSync(path.join(DIR, 'sender.js'), 'utf8');
      const re = new RegExp(/var GW_URL_RE = \/(.+)\/;/.exec(src)[1]);
      const good = ['https://script.google.com/macros/s/AKfycbx_abc-123/exec', 'https://script.google.com/a/macros/billlayneinsurance.com/s/AKfycbx_abc-123/exec'];
      const bad = ['http://script.google.com/macros/s/abc/exec', 'https://script.google.com.evil.example/macros/s/abc/exec', 'https://evil.example/macros/s/abc/exec',
        'https://script.google.com@evil.example/macros/s/abc/exec', 'https://script.google.com/macros/s/abc/exec?next=https://evil.example', 'https://script.google.com/macros/s/abc/dev',
        'https://script.google.com/macros/s/abc/exec/../x', 'https://docs.google.com/macros/s/abc/exec', 'javascript:alert(1)//script.google.com/macros/s/abc/exec', ''];
      ok('the address rule accepts the two Google web app forms and rejects look-alikes', good.every(u => re.test(u)) && bad.every(u => !re.test(u)), { good: good.map(u => re.test(u)), bad: bad.map(u => re.test(u)) });
      for (const f of ['studio.js', 'receipt.js', 'gateway-client.js', 'moved.js']) {
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
      await t.open('', zLink('customer D', 'customer-d@example.invalid')); log.length = 0;
      await t.page.waitForFunction(() => document.getElementById('htmlInput').value.includes('Welcome, customer D'));
      const st = await state(t.page);
      const subject = await t.page.evaluate(() => document.getElementById('subjectInput').value);
      ok('a hand-off link (#z=) still loads the email, its recipient and subject, with no questions', st.to === 'customer-d@example.invalid' && subject === 'welcome customer D' && !/show/.test(st.carry) && !/show/.test(st.setup), { st, subject });
      ok('...and leaves the address bar clean', !(await t.page.evaluate(() => location.hash)));
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      ok('...and drafts it', log.length === 1 && log[0].mode === 'draft' && log[0].to === 'customer-d@example.invalid', log);
      ok('the sender page ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
    {
      // a hand-off email and a setup link in one fragment (what the old address sends on the first visit)
      const t = await fresh(null); log.length = 0;
      await t.open('', zLink('customer F', 'customer-f@example.invalid') + '&gw=' + b64url(JSON.stringify({ u: REAL, s: 'dummy-secret-123' })));
      await t.page.waitForFunction(() => document.getElementById('htmlInput').value.includes('Welcome, customer F'));
      let st = await state(t.page), s = await t.saved();
      ok('email + setup link together: the email loads AND the setup question is asked, nothing saved yet', st.to === 'customer-f@example.invalid' && /ask-card show$/.test(st.setup) && !s.url && !log.length, { st: st.setupText, s });
      ok('...and nothing of either is left in the address bar', !(await t.page.evaluate(() => location.hash)));
      await t.page.click('#setupYes'); await t.page.waitForTimeout(700);
      s = await t.saved(); st = await state(t.page);
      ok('...Yes connects, and the email is still on the page', s.url === REAL && /connected/.test(st.badge) && st.to === 'customer-f@example.invalid', { s, badge: st.badge });
      await t.ctx.close();
    }
    {
      const t = await fresh(SETTINGS); log.length = 0;
      for (const f of ['studio.html', 'receipt.html']) {
        await t.open(f); await t.page.waitForTimeout(600);
        const badge = await t.page.evaluate(() => document.getElementById('connBadge').textContent);
        ok(f + ' still connects to a saved gateway', /connected/.test(badge), badge);
      }
      await t.open('receipt.html', '#d=' + b64url(JSON.stringify({ first: 'Test', last: 'Person', to: 'customer-g@example.invalid', amount: '123.45' })));
      const r = await t.page.evaluate(() => ({ first: document.getElementById('first').value, to: document.getElementById('to').value, amount: document.getElementById('amount').value, hash: location.hash }));
      ok('Receipt Builder still takes a prefill link (#d=)', r.first === 'Test' && r.to === 'customer-g@example.invalid' && r.amount === '123.45' && !r.hash, r);
      ok('Mail Studio and Receipt Builder ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }

    /* ===== 6. the drop-in client other tools copy ===== */
    {
      const t = await fresh(null); log.length = 0;
      const client = async (hash) => { await t.page.goto(mockBase + '/_t/client.html?t=' + Date.now() + Math.random() + (hash || ''), { waitUntil: 'load' }); await t.page.waitForTimeout(500); };
      await t.seedOn(mockBase, SETTINGS);
      await client(gwLink({ u: EVIL }));
      let s = await t.saved();
      ok('gateway-client.js: a link with only an address is ignored without a word', s.url === REAL && !(await t.page.$('#bliGwSetupAsk')), s);
      await client(gwLink({ u: OTHER, s: 'other-secret' }));
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

    /* ===== 7. the new address: what is served, and under which policy ===== */
    {
      const get = (p, init) => fetch(base + p, Object.assign({ redirect: 'manual' }, init || {}));
      let r = await get('/');
      const csp = r.headers.get('content-security-policy') || '';
      ok('the Universal Sender is served with a policy that allows only its own scripts', r.status === 200 && /script-src 'self'(;|$)/.test(csp) && /default-src 'none'/.test(csp) && !/unsafe-eval/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp), csp);
      ok('...may only talk to the Google script and the website health check', /connect-src https:\/\/script\.google\.com https:\/\/script\.googleusercontent\.com https:\/\/www\.billlayneinsurance\.com( http:\/\/127\.0\.0\.1:\* http:\/\/localhost:\*)?(;|$)/.test(csp), csp);
      ok('...cannot be framed, cached or rewritten in transit', /frame-ancestors 'none'/.test(csp) && r.headers.get('x-frame-options') === 'DENY' && /no-store/.test(r.headers.get('cache-control')) && /no-transform/.test(r.headers.get('cache-control')) && r.headers.get('x-content-type-options') === 'nosniff', Object.fromEntries(r.headers));
      ok('...and is kept out of search engines', /noindex/.test(r.headers.get('x-robots-tag') || ''));
      ok('the policy for the real address has no local test addresses in it', !/127\.0\.0\.1|localhost/.test(rules.contentSecurityPolicy(false)) && /127\.0\.0\.1/.test(rules.contentSecurityPolicy(true)));
      for (const p of ['/studio.html', '/receipt.html', '/sender.js', '/moved.js', '/studio.js', '/receipt.js', '/studio-templates.js', '/receipt-template.js']) {
        r = await get(p);
        ok(p + ' is served with the policy', r.status === 200 && /script-src 'self'/.test(r.headers.get('content-security-policy') || ''), r.status);
      }
      for (const p of ['/README.md', '/Code.gs', '/HANDOFF-GATEWAY-INTEGRATION.md', '/gateway-client.js', '/test-email-sample.html', '/.assetsignore', '/anything-else', '/..%2f..%2fCNAME']) {
        r = await get(p);
        ok(p + ' is not served (404)', r.status === 404, r.status);
      }
      r = await get('/mail-gateway/studio.html?x=1');
      ok('an old-style path on the new address is passed on (/mail-gateway/studio.html -> /studio.html)', r.status === 301 && /\/studio\.html\?x=1$/.test(r.headers.get('location') || ''), { status: r.status, location: r.headers.get('location') });
      r = await get('/', { method: 'POST', body: 'x' });
      ok('the new address accepts nothing but reads (POST is refused)', r.status === 405, r.status);
      for (const f of ['index.html', 'studio.html', 'receipt.html']) {
        const html = fs.readFileSync(path.join(DIR, f), 'utf8');
        const inline = (html.match(/<script(?![^>]*\bsrc=)[^>]*>/gi) || []).length, handlers = (html.match(/\son[a-z]+\s*=\s*["']/gi) || []).length;
        ok(f + ' has no inline script and no inline event handlers (the policy would block them)', inline === 0 && handlers === 0 && /<script src="moved\.js/.test(html), { inline, handlers });
      }
    }
    {
      // the key box is plain text drawn as dots (never type=password, which password managers fill)
      const t = await fresh(SETTINGS);
      for (const [f, btn] of [['', '#showSecret'], ['studio.html', '#showSecretBtn'], ['receipt.html', '#showSecretBtn']]) {
        await t.open(f);
        await t.page.evaluate(() => { document.getElementById('settingsCard').open = true; });
        const look = () => t.page.evaluate(() => { const el = document.getElementById('gwSecret'); return { type: el.type, masked: getComputedStyle(el).webkitTextSecurity, value: el.value }; });
        let k = await look();
        const hidden = k.type === 'text' && k.masked === 'disc' && k.value === 'dummy-secret-123';
        await t.page.click(btn); k = await look();
        const shown = k.type === 'text' && k.masked === 'none';
        await t.page.click(btn); k = await look();
        ok((f || 'sender page') + ': the key box is masked text, and Show / Hide works', hidden && shown && k.masked === 'disc', k);
      }
      await t.ctx.close();
    }

    /* ===== 8. three keys ===== */
    {
      // a browser that holds the draft-only key can draft but never send
      for (const k of Object.keys(strictKeys)) delete strictKeys[k];
      Object.assign(strictKeys, { 'full-key-0001': 'full', 'draft-key-0001': 'draft' });
      const t = await fresh({ url: STRICT, secret: 'draft-key-0001' });
      await t.open(''); log.length = 0;
      let st = await state(t.page);
      ok('sender page: a draft-only key is named in the connection badge', /connected/.test(st.badge) && /draft-only key/.test(st.badge), st.badge);
      await loadEmail(t.page, 'customer A'); await t.page.fill('#toInput', 'customer-a@example.invalid');
      await t.page.click('#sendBtn'); await t.page.waitForTimeout(250); await t.page.click('#sendBtn'); await t.page.waitForTimeout(400);
      st = await state(t.page);
      ok('...Send Now is refused on the page, and nothing is posted', /NOT SENT/.test(st.result) && /draft-only key/.test(st.result) && !log.some(x => x.mode === 'send'), { result: st.result, log });
      await t.page.click('#draftBtn'); await t.page.waitForTimeout(700);
      st = await state(t.page);
      ok('...Create Gmail Draft still works', /Draft created/.test(st.result) && log.filter(x => x.mode === 'draft').length === 1, st.result);
      for (const f of ['studio.html', 'receipt.html']) {
        await t.open(f); log.length = 0;
        const badge = await t.page.evaluate(() => document.getElementById('connBadge').textContent);
        await t.page.click('#sendBtn'); await t.page.waitForTimeout(300);
        const result = await t.page.evaluate(() => document.getElementById('result').textContent);
        ok(f + ': draft-only key shown, Send Now refused before anything else', /draft-only key/.test(badge) && /NOT SENT/.test(result) && /draft-only key/.test(result) && !log.some(x => x.mode === 'send'), { badge, result });
      }
      ok('the draft-only pages ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
    {
      // the key helper: make, paste into Script properties (here: tell the mock), test, hand out
      for (const k of Object.keys(strictKeys)) delete strictKeys[k];
      strictKeys['old-full-key-0001'] = 'full';
      const t = await fresh({ url: STRICT, secret: 'old-full-key-0001' });
      const stubOpen = () => t.page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
      await t.open(''); log.length = 0;
      await t.page.evaluate(() => { document.getElementById('settingsCard').open = true; document.getElementById('keysBox').open = true; });
      const shown = () => t.page.evaluate(() => ({ f: document.getElementById('newFullKey').value, d: document.getElementById('newDraftKey').value, a: document.getElementById('newAgencyKey').value,
        hidden: document.getElementById('keysShown').hidden, test: document.getElementById('keysTest').disabled, pdf: document.getElementById('keysPdfStudio').disabled,
        copyDraft: document.getElementById('keysCopyDraft').disabled, copyAgency: document.getElementById('keysCopyAgency').disabled, pending: sessionStorage.getItem('bliMailGateway.pendingKeys') }));
      let k = await shown();
      ok('before anything: no keys shown, Test and the hand-out buttons are off', k.hidden && k.test && k.pdf && k.copyDraft && k.copyAgency && !k.pending, k);
      await t.page.click('#keysMake');
      k = await shown();
      const strong = (x) => /^[A-Za-z0-9]{40}$/.test(x);
      let s = await t.saved();
      ok('Make three new keys: three different 40-character keys appear', strong(k.f) && strong(k.d) && strong(k.a) && new Set([k.f, k.d, k.a]).size === 3 && !k.hidden && !k.test, { f: k.f.length, d: k.d.length, a: k.a.length });
      ok('...and nothing has changed yet: this browser still holds the old key and nothing was posted', s.secret === 'old-full-key-0001' && !s.draft && !s.agency && !log.length, { s, log });
      const first = { f: k.f, d: k.d, a: k.a };
      await t.page.click('#keysMake'); k = await shown();
      ok('a second click on Make does not throw the waiting keys away', k.f === first.f && /Click again/.test(await t.page.textContent('#keysMake')), await t.page.textContent('#keysMake'));
      await t.open('');
      k = await shown();
      const reopened = await t.page.evaluate(() => document.getElementById('keysBox').open && document.getElementById('settingsCard').open);
      ok('a reload in the middle keeps the waiting keys (this tab only) and opens the helper', k.f === first.f && k.d === first.d && k.a === first.a && reopened, { same: k.f === first.f, reopened });

      log.length = 0;
      await t.page.click('#keysTest'); await t.page.waitForTimeout(900);
      let st = await state(t.page); s = await t.saved();
      ok('Test before Script properties are saved: "not in place yet", this browser keeps the old key', /not in place yet/.test(st.keys) && s.secret === 'old-full-key-0001' && log.filter(x => x.mode === 'ping').length === 3 && log.every(x => x.mode === 'ping'), { keys: st.keys, s });

      strictKeys[first.f] = 'draft'; strictKeys[first.d] = 'full';              // pasted into the wrong boxes
      await t.page.click('#keysTest'); await t.page.waitForTimeout(900);
      st = await state(t.page); s = await t.saved();
      ok('keys pasted into the wrong boxes are caught, and nothing changes', /wrong boxes/.test(st.keys) && s.secret === 'old-full-key-0001' && !s.draft, { keys: st.keys, s });

      delete strictKeys[first.d]; strictKeys[first.f] = 'full'; delete strictKeys['old-full-key-0001'];   // only the full key is in place; the old key is dead
      await t.page.click('#keysTest'); await t.page.waitForTimeout(900);
      st = await state(t.page); s = await t.saved(); k = await shown();
      ok('full key in place, the other two not yet: this browser switches to the new full key and says what is missing', s.secret === first.f && !s.draft && !s.agency && /GATEWAY_DRAFT_SECRET/.test(st.keys) && /GATEWAY_AGENCY_SECRET/.test(st.keys) && /connected/.test(st.badge) && !/draft-only/.test(st.badge), { keys: st.keys, badge: st.badge });
      ok('...the waiting keys stay on screen so the other two can still be copied', !k.hidden && k.d === first.d && k.a === first.a && k.pdf, k.hidden);

      strictKeys[first.d] = 'draft'; strictKeys[first.a] = 'agency';
      await t.page.click('#keysTest'); await t.page.waitForTimeout(900);
      st = await state(t.page); s = await t.saved(); k = await shown();
      ok('all three in place: "All three keys work", each key saved where it belongs', /All three keys work/.test(st.keys) && s.secret === first.f && s.draft === first.d && s.agency === first.a, { keys: st.keys });
      ok('...the helper is cleared and the hand-out buttons come on', k.hidden && !k.pending && !k.pdf && !k.copyDraft && !k.copyAgency && k.test, k);

      await stubOpen();
      await t.page.click('#keysPdfStudio');
      const link = (await t.page.evaluate(() => window.__opened))[0] || '';
      const carried = link.indexOf('#gw=') > 0 ? JSON.parse(unb64url(link.split('#gw=')[1])) : {};
      ok('Connect PDF Studio opens PDF Studio with the DRAFT-ONLY key, never the full key', /^https:\/\/www\.billlayneinsurance\.com\/pdf-tools\/#gw=/.test(link) && carried.u === STRICT && carried.s === first.d && link.indexOf(first.f) === -1 && JSON.stringify(carried).indexOf(first.f) === -1, { link: link.slice(0, 60), u: carried.u });
      await t.page.bringToFront();
      await t.page.click('#keysCopyDraft'); await t.page.waitForTimeout(300);
      const clipDraft = await t.page.evaluate(() => navigator.clipboard.readText()).catch(e => 'clipboard: ' + e.message);
      await t.page.click('#keysCopyAgency'); await t.page.waitForTimeout(300);
      const clipAgency = await t.page.evaluate(() => navigator.clipboard.readText()).catch(e => 'clipboard: ' + e.message);
      ok('the Copy buttons put the draft-only key and the website key on the clipboard', clipDraft === first.d && clipAgency === first.a, { draft: clipDraft === first.d, agency: clipAgency === first.a });

      // the website's After an Accident report, seen from here
      siteHealth = { ok: true, connected: true, ready: true, scope: 'agency', version: '1.4' };
      await t.page.click('#keysCheckSite'); await t.page.waitForTimeout(600);
      st = await state(t.page);
      ok('Check the After an Accident page: connected with the website key', /ask-card show ok/.test(st.keysCls) && /website key/.test(st.keys), st.keys);
      siteHealth = { ok: true, connected: true, ready: true, scope: 'full', version: '1.4' };
      await t.page.click('#keysCheckSite'); await t.page.waitForTimeout(600);
      st = await state(t.page);
      ok('...still holding a full key is flagged', /still holds a full key/.test(st.keys) && /SET-WEBSITE-MAIL-KEY\.cmd/.test(st.keys), st.keys);
      siteHealth = { ok: true, connected: false, ready: false, scope: null, version: null };
      await t.page.click('#keysCheckSite'); await t.page.waitForTimeout(600);
      st = await state(t.page);
      ok('...a dead key is called out plainly', /ask-card show err/.test(st.keysCls) && /cannot send right now/.test(st.keys), st.keys);
      ok('the key helper ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
    {
      // an older gateway (one key only) says so instead of pretending
      for (const k of Object.keys(strictKeys)) delete strictKeys[k];
      strictKeys['old-full-key-0002'] = 'full';
      const t = await fresh({ url: OLDGW, secret: 'old-full-key-0002' });
      await t.open('');
      await t.page.evaluate(() => { document.getElementById('settingsCard').open = true; document.getElementById('keysBox').open = true; });
      await t.page.click('#keysMake');
      const f = await t.page.inputValue('#newFullKey');
      strictKeys[f] = 'full';
      await t.page.click('#keysTest'); await t.page.waitForTimeout(900);
      const st = await state(t.page);
      ok('a gateway that is still the old version is named as the reason the extra keys do not work', /older version/.test(st.keys) && (await t.saved()).secret === f, st.keys);
      await t.ctx.close();
    }
    {
      const t = await fresh(null);       // not connected yet: the helper refuses to start
      await t.open('');
      await t.page.evaluate(() => { document.getElementById('keysBox').open = true; });
      await t.page.click('#keysMake');
      const st = await state(t.page);
      ok('the key helper will not make keys in a browser that is not connected', /Connect this browser to the gateway first/.test(st.keys) && await t.page.evaluate(() => document.getElementById('keysShown').hidden), st.keys);
      await t.ctx.close();
    }

    /* ===== 9. the old address passes visitors on ===== */
    {
      const t = await fresh(null); log.length = 0;
      await t.seedOn(OLD_ORIGIN, { url: GOOGLE, secret: 'old-site-key-0001' });
      await t.page.goto(OLD_SITE, { waitUntil: 'load' });
      await t.page.waitForSelector('#movedCard');
      let v = await t.page.evaluate(() => ({ title: document.title, host: location.hostname, sender: !!document.getElementById('draftBtn'), text: document.body.innerText }));
      ok('old address + a saved connection: the page does not run, it shows "moved" with one button', v.host === 'www.billlayneinsurance.com' && !v.sender && /has moved/.test(v.title) && /Connect this browser and open it/.test(v.text), v);
      ok('...and the old page used the key for nothing (no request left it)', !log.length, log);
      await t.page.click('#movedConnect');
      await t.page.waitForSelector('#setupYes');
      v = await t.page.evaluate(() => ({ origin: location.origin, path: location.pathname, hash: location.hash, url: localStorage.getItem('bliMailGateway.url') }));
      let st = await state(t.page);
      ok('one click lands on the new address, which ASKS before saving', v.origin === NEW_SITE && v.path === '/' && !v.hash && !v.url && /No gateway is saved in this browser yet/.test(st.setupText) && !log.length, { v, setup: st.setupText });
      await t.page.click('#setupYes'); await t.page.waitForTimeout(800);
      const s = await t.saved(); st = await state(t.page);
      ok('Yes: the new address is connected with the carried key', s.url === GOOGLE && s.secret === 'old-site-key-0001' && /connected/.test(st.badge) && sent('/google').some(x => x.mode === 'ping'), { s, badge: st.badge });

      await t.page.goto(OLD_SITE + 'studio.html?x=1', { waitUntil: 'load' });       // the connection was carried once: now it is a plain pass-on
      await t.page.waitForFunction(() => location.hostname === 'mail.billlayneinsurance.com' && !!document.getElementById('connBadge'));
      await t.page.waitForTimeout(600);
      v = await t.page.evaluate(() => ({ path: location.pathname, search: location.search, title: document.title, badge: document.getElementById('connBadge').textContent }));
      ok('next visit to the old address goes straight through (Mail Studio, query kept, connected)', v.path === '/studio.html' && v.search === '?x=1' && /Mail Studio/.test(v.title) && /connected/.test(v.badge), v);
      ok('the bridge ran without script errors', !t.errors.length, t.errors);
      await t.ctx.close();
    }
    {
      // first visit after the move arrives through a hand-off link (a launcher file, a template button)
      const t = await fresh(null); log.length = 0;
      await t.seedOn(OLD_ORIGIN, { url: GOOGLE, secret: 'old-site-key-0002' });
      await t.page.goto(OLD_SITE + zLink('customer H', 'customer-h@example.invalid'), { waitUntil: 'load' });
      await t.page.waitForSelector('#movedCard');
      await t.page.click('#movedConnect');
      await t.page.waitForSelector('#setupYes');
      await t.page.waitForFunction(() => document.getElementById('htmlInput').value.includes('Welcome, customer H'));
      let st = await state(t.page);
      ok('a hand-off email rides along with the carried connection', st.to === 'customer-h@example.invalid' && !(await t.page.evaluate(() => location.hash)), st.to);
      await t.page.click('#setupYes'); await t.page.waitForTimeout(800);
      st = await state(t.page);
      ok('...and after Yes the email is still there, ready to draft', /connected/.test(st.badge) && st.to === 'customer-h@example.invalid', st.badge);
      await t.ctx.close();
    }
    {
      const t = await fresh(null); log.length = 0;      // nothing saved at the old address: straight through, fragment intact
      await t.page.goto(OLD_SITE + 'receipt.html#d=' + b64url(JSON.stringify({ first: 'Carried', amount: '50.00' })), { waitUntil: 'load' });
      await t.page.waitForFunction(() => location.hostname === 'mail.billlayneinsurance.com' && !!document.getElementById('first'));
      await t.page.waitForTimeout(500);
      let v = await t.page.evaluate(() => ({ path: location.pathname, first: document.getElementById('first').value, amount: document.getElementById('amount').value }));
      ok('old address with nothing saved: passed straight on, and a receipt prefill (#d=) survives the trip', v.path === '/receipt.html' && v.first === 'Carried' && v.amount === '50.00', v);

      await t.seedOn(OLD_ORIGIN, { url: 'http://127.0.0.1:1/not-google', secret: 'x' });
      await t.page.goto(OLD_SITE, { waitUntil: 'load' });
      await t.page.waitForFunction(() => location.hostname === 'mail.billlayneinsurance.com' && !!document.getElementById('setupAsk'));
      v = await t.page.evaluate(() => ({ setup: document.getElementById('setupAsk').className, hash: location.hash }));
      ok('a saved address that is not a Google script is never carried', v.setup === 'ask-card' && !v.hash, v);

      await t.seedOn(OLD_ORIGIN, { url: GOOGLE, secret: 'old-site-key-0003' });
      await t.page.goto(OLD_SITE, { waitUntil: 'load' });
      await t.page.waitForSelector('#movedSkip');
      await t.page.click('#movedSkip');
      await t.page.waitForFunction(() => location.hostname === 'mail.billlayneinsurance.com' && !!document.getElementById('setupAsk'));
      const sNew = await t.saved();
      await t.page.goto(OLD_SITE, { waitUntil: 'load' });
      const again = await t.page.waitForSelector('#movedCard', { timeout: 5000 }).then(() => true, () => false);
      ok('"Open it without connecting" carries nothing, and the offer is still there next time', !sNew.url && again && !log.length, { sNew, again });
      await t.ctx.close();
    }

    ok('no page broke its own security policy during the whole run', policyBreaks.length === 0, policyBreaks.slice(0, 4));
    ok('no page threw a script error during the whole run', pageErrors.length === 0, pageErrors.slice(0, 4));
  } catch (e) {
    ok('the test run itself finished', false, String(e && e.stack || e).slice(0, 700));
  }

  await browser.close();
  server.close(); oldServer.close();
  const failed = results.filter(r => !r.pass);
  console.log('\n' + (failed.length ? 'FAILED ' + failed.length + ' of ' : 'PASS: all ') + results.length + ' checks');
  process.exit(failed.length ? 1 : 0);
})();
