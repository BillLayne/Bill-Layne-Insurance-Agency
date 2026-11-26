/**
 * After an Accident report function test (functions/api/accident-report.js).
 * Runs the real function in Node with a stand-in for the mail gateway.
 * Nothing is sent, no gateway is contacted.
 *
 *   node tools/mail-gateway-tests/accident.test.mjs
 *
 * What it protects (2026-11-26): the health check never sends and tells the truth about the
 * saved key, and a real report still goes out exactly as before.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.env.ACCIDENT_JS ? path.resolve(process.env.ACCIDENT_JS) : path.resolve(here, '..', '..', 'functions', 'api', 'accident-report.js');
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'accident-test-')), 'accident-report.mjs');
fs.copyFileSync(src, tmp);                                   // the file is an ES module; .mjs lets Node load it as one
const { handleAccidentReport, accidentHealth } = await import(pathToFileURL(tmp).href);

const results = [];
const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? '  PASS ' : '  FAIL ') + name + (!pass && info !== undefined ? '  -> ' + JSON.stringify(info) : '')); };

const ENV = { BLI_MAIL_GATEWAY_URL: 'https://gateway.invalid/exec', BLI_MAIL_GATEWAY_SECRET: 'test-key-0123456789abcdef' };
// A gateway stand-in that records every request and answers the way Code.gs v1.4 does.
function gateway(scope, opts = {}) {
  const calls = [];
  const fetcher = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, mode: body.mode, to: body.to, secret: body.secret, files: (body.attachments || []).length });
    if (opts.down) throw new Error('network');
    if (!scope) return Response.json({ ok: false, error: 'Unauthorized: bad or missing secret.' });
    if (body.mode === 'ping') return Response.json(Object.assign({ ok: true, mode: 'ping', version: opts.version || '1.4' }, opts.noScope ? {} : { scope }));
    return Response.json({ ok: true, mode: body.mode, scope, attached: (body.attachments || []).length });
  };
  return { fetcher, calls };
}
const health = async (env, g, extra = '') => {
  const res = await accidentHealth({ request: new Request('https://www.billlayneinsurance.com/api/accident-report?health=1' + extra), env }, g.fetcher, null);
  return { status: res.status, body: await res.json(), headers: res.headers };
};

/* ---- the health check ---- */
{
  let g = gateway('agency'), r = await health(ENV, g);
  ok('website key + agency inbox: connected and ready', r.status === 200 && r.body.connected && r.body.ready && r.body.scope === 'agency' && r.body.version === '1.4', r.body);
  ok('the health check only ever pings', g.calls.length === 1 && g.calls[0].mode === 'ping', g.calls);
  ok('...and may be read from the Mail Gateway page only', r.headers.get('access-control-allow-origin') === 'https://mail.billlayneinsurance.com', r.headers.get('access-control-allow-origin'));
  ok('...and the answer holds no key, address or inbox', !/test-key|gateway\.invalid|docs@/i.test(JSON.stringify(r.body)), r.body);

  g = gateway('agency'); r = await health(Object.assign({}, ENV, { ACCIDENT_REPORT_TO: 'someone@example.invalid' }), g);
  ok('website key + an outside inbox: connected but NOT ready (the gateway would refuse every report)', r.body.connected && !r.body.ready, r.body);
  g = gateway('agency'); r = await health(Object.assign({}, ENV, { ACCIDENT_REPORT_TO: 'Docs@BillLayneInsurance.com' }), g);
  ok('website key + agency inbox in any letter case: ready', r.body.ready, r.body);

  g = gateway('full'); r = await health(ENV, g);
  ok('full key: connected and ready, reported as full', r.body.connected && r.body.ready && r.body.scope === 'full', r.body);
  g = gateway('full', { noScope: true, version: '1.3' }); r = await health(ENV, g);
  ok('an older gateway (no scope in its answer) counts as a full key', r.body.connected && r.body.ready && r.body.scope === 'full' && r.body.version === '1.3', r.body);
  g = gateway('draft'); r = await health(ENV, g);
  ok('draft-only key: connected but NOT ready (it cannot send)', r.body.connected && !r.body.ready && r.body.scope === 'draft', r.body);
  g = gateway(''); r = await health(ENV, g);
  ok('a key the gateway does not know: not connected', !r.body.connected && !r.body.ready, r.body);
  g = gateway('agency', { down: true }); r = await health(ENV, g);
  ok('gateway unreachable: not connected, no crash', r.status === 200 && !r.body.connected, r.body);
  g = gateway('agency'); r = await health({}, g);
  ok('no key saved: not connected and the gateway is not contacted', !r.body.connected && g.calls.length === 0, r.body);

  // the two-minute memory: one gateway ping however often it is asked
  const store = new Map();
  const cache = { match: async (k) => { const v = store.get(k.url); return v ? v.clone() : undefined; }, put: async (k, v) => { store.set(k.url, v); } };
  g = gateway('agency');
  for (const extra of ['', '&t=1', '&t=2', '&anything=else']) {
    await accidentHealth({ request: new Request('https://www.billlayneinsurance.com/api/accident-report?health=1' + extra), env: ENV }, g.fetcher, cache);
  }
  ok('asked four times with different extras: the gateway is pinged once', g.calls.length === 1, g.calls.length);
}

/* ---- a real report is unchanged ---- */
{
  const REPORT = { formType: 'accident-report', ref: 'ACC-261126-TEST', part: 1, parts: 1, name: 'Test Person', phone: '336-555-0100', email: 'customer@example.invalid',
    summary: 'Test summary', files: [{ name: 'photo 1.jpg', type: 'image/jpeg', base64: Buffer.from('fake-jpeg').toString('base64') }] };
  const post = (g, body, headers = {}) => handleAccidentReport({ request: new Request('https://www.billlayneinsurance.com/api/accident-report', {
    method: 'POST', headers: Object.assign({ origin: 'https://www.billlayneinsurance.com', 'content-type': 'application/json' }, headers), body: JSON.stringify(body) }), env: ENV }, g.fetcher);

  let g = gateway('agency'), res = await post(g, REPORT), j = await res.json();
  ok('a report still sends: one send to the agency inbox with its photo', res.status === 200 && j.ok && j.ref === 'ACC-261126-TEST' && g.calls.length === 1 && g.calls[0].mode === 'send' &&
    g.calls[0].to === 'docs@BillLayneInsurance.com' && g.calls[0].files === 1 && g.calls[0].secret === ENV.BLI_MAIL_GATEWAY_SECRET, { status: res.status, j, calls: g.calls });
  g = gateway(''); res = await post(g, REPORT); j = await res.json();
  ok('a refused key is still reported to the page as unconfirmed (502), so the customer sees the call-us fallback', res.status === 502 && j.status === 'unconfirmed', { status: res.status, j });
  g = gateway('agency'); res = await post(g, REPORT, { origin: 'https://evil.example' });
  ok('a report from another site is still refused', res.status === 403 && g.calls.length === 0, res.status);
  g = gateway('agency'); res = await handleAccidentReport({ request: new Request('https://www.billlayneinsurance.com/api/accident-report'), env: ENV }, g.fetcher);
  ok('a plain GET is still 405 and contacts nothing', res.status === 405 && g.calls.length === 0, res.status);
  g = gateway('agency'); res = await handleAccidentReport({ request: new Request('https://www.billlayneinsurance.com/api/accident-report?health=1'), env: ENV }, g.fetcher);
  j = await res.json();
  ok('GET ?health=1 on the same address answers the health check', res.status === 200 && j.connected === true && g.calls.length === 1 && g.calls[0].mode === 'ping', j);
}

fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? 'FAILED ' + failed.length + ' of ' : 'PASS: all ') + results.length + ' checks');
process.exit(failed.length ? 1 : 0);
