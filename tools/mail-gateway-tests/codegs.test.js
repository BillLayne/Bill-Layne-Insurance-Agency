/**
 * Code.gs test - runs the real mail-gateway/Code.gs in Node against stand-ins for the
 * Google services, so the key rules can be checked before the script is redeployed.
 * Nothing here talks to Google, creates a draft or sends an email.
 *
 *   node tools/mail-gateway-tests/codegs.test.js
 *
 * What it protects (v1.4, 2026-11-26): two keys.
 *   GATEWAY_SECRET        full key: ping, draft, send
 *   GATEWAY_DRAFT_SECRET  draft-only key: ping and draft, NEVER send
 * and that a gateway with no draft-only key behaves exactly as v1.3 did.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(process.env.CODE_GS || path.resolve(__dirname, '..', '..', 'mail-gateway', 'Code.gs'), 'utf8');
const results = [];
const ok = (name, pass, info) => { results.push({ name, pass: !!pass }); console.log((pass ? '  PASS ' : '  FAIL ') + name + (!pass && info !== undefined ? '  -> ' + JSON.stringify(info) : '')); };

const FULL = 'full-key-for-tests-0123456789abcdef';
const DRAFT = 'draft-key-for-tests-0123456789abcdef';

// A fresh copy of the script with its own fake Google account.
function gateway(props) {
  const calls = { sent: [], drafts: [], logs: [] };
  const sandbox = {
    console: { log: (m) => calls.logs.push(String(m)) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (Object.prototype.hasOwnProperty.call(props, k) ? props[k] : null) }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ text: t, setMimeType() { return this; } }) },
    GmailApp: {
      sendEmail: (to, subject, text, options) => { calls.sent.push({ to, subject, text, options }); },
      createDraft: (to, subject, text, options) => { calls.drafts.push({ to, subject, text, options }); return { getId: () => 'draft-1', getMessage: () => ({ getId: () => 'msg-1' }) }; },
    },
    MailApp: { getRemainingDailyQuota: () => 1499 },
    Session: { getActiveUser: () => ({ getEmail: () => 'agency@example.invalid' }) },
    Utilities: { base64Decode: (b) => Array.from(Buffer.from(b, 'base64')), newBlob: (bytes, mimeType, name) => ({ bytes, mimeType, name }) },
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'Code.gs' });
  const post = (body, query) => JSON.parse(sandbox.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) }, parameter: query || {} }).text);
  const get = () => JSON.parse(sandbox.doGet().text);
  return { post, get, calls };
}
const EMAIL = { to: 'customer@example.invalid', subject: 'your auto quote', html: '<!doctype html><html><body><p>Hello</p></body></html>' };

/* ---- 1. a gateway with only the full key is unchanged ---- */
{
  const g = gateway({ GATEWAY_SECRET: FULL });
  ok('health check reports v1.4', g.get().version === '1.4' && g.get().ok === true, g.get());
  let r = g.post({ secret: FULL, mode: 'ping' });
  ok('full key: ping works and says scope full', r.ok && r.mode === 'ping' && r.scope === 'full' && r.remainingQuota === 1499, r);
  r = g.post(Object.assign({ secret: FULL, mode: 'draft' }, EMAIL));
  ok('full key: draft is created', r.ok && r.mode === 'draft' && r.draftId === 'draft-1' && r.messageId === 'msg-1' && g.calls.drafts.length === 1 && !g.calls.sent.length, r);
  r = g.post(Object.assign({ secret: FULL, mode: 'send' }, EMAIL));
  ok('full key: send goes out', r.ok && r.mode === 'send' && r.scope === 'full' && g.calls.sent.length === 1 && g.calls.sent[0].to === EMAIL.to, r);
  ok('default BCC is still Save@ when the field is left out', g.calls.sent[0].options.bcc === 'Save@BillLayneInsurance.com' && g.calls.drafts[0].options.bcc === 'Save@BillLayneInsurance.com', g.calls.sent[0].options);
  r = g.post(Object.assign({ secret: FULL, mode: 'draft', bcc: '' }, EMAIL));
  ok('an explicit empty BCC still means no BCC', r.ok && !('bcc' in g.calls.drafts[1].options), g.calls.drafts[1].options);
  r = g.post(Object.assign({ secret: FULL }, EMAIL));
  ok('no mode still means draft', r.ok && r.mode === 'draft', r);
  for (const bad of [undefined, '', 'wrong', FULL + 'x', FULL.slice(0, -1), DRAFT]) {
    const before = g.calls.sent.length + g.calls.drafts.length;
    r = g.post(Object.assign({ secret: bad, mode: 'send' }, EMAIL));
    ok('wrong or missing key is refused (' + (bad === undefined ? 'none' : bad === '' ? 'empty' : bad === DRAFT ? 'a draft key that was never set up' : 'wrong') + ')', !r.ok && /Unauthorized/.test(r.error) && g.calls.sent.length + g.calls.drafts.length === before, r);
  }
  r = g.post(Object.assign({ secret: FULL, mode: 'draft', attachments: [{ name: 'dec.pdf', mimeType: 'application/pdf', dataB64: Buffer.from('%PDF-1.4').toString('base64') }] }, EMAIL));
  ok('attachments still go through', r.ok && r.attached === 1 && g.calls.drafts[g.calls.drafts.length - 1].options.attachments[0].name === 'dec.pdf', r);
  r = g.post('not json');
  ok('a body that is not JSON is refused', !r.ok, r);
  r = g.post({ secret: FULL, mode: 'delete-everything' });
  ok('an unknown mode is refused', !r.ok && /mode must be/.test(r.error), r);
}

/* ---- 2. the draft-only key ---- */
{
  const g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: DRAFT });
  let r = g.post({ secret: DRAFT, mode: 'ping' });
  ok('draft-only key: ping works and says scope draft', r.ok && r.scope === 'draft', r);
  r = g.post(Object.assign({ secret: DRAFT, mode: 'draft' }, EMAIL));
  ok('draft-only key: draft is created', r.ok && r.mode === 'draft' && r.scope === 'draft' && g.calls.drafts.length === 1, r);
  for (const mode of ['send', 'SEND', ' Send'.trim(), 'sEnD']) {
    r = g.post(Object.assign({ secret: DRAFT, mode }, EMAIL));
    ok('draft-only key: "' + mode + '" is refused and nothing is sent', !r.ok && /only create drafts/.test(r.error) && /Nothing was sent/.test(r.error) && g.calls.sent.length === 0, r);
  }
  r = g.post(Object.assign({ mode: 'send' }, EMAIL), { secret: DRAFT });
  ok('draft-only key in the address (?secret=) cannot send either', !r.ok && g.calls.sent.length === 0, r);
  r = g.post(Object.assign({ mode: 'draft' }, EMAIL), { secret: DRAFT });
  ok('...but can still draft', r.ok && r.mode === 'draft', r);
  r = g.post(Object.assign({ secret: FULL, mode: 'send' }, EMAIL));
  ok('the full key still sends when a draft-only key exists', r.ok && r.scope === 'full' && g.calls.sent.length === 1, r);
  r = g.post({ secret: FULL, mode: 'ping' });
  ok('...and still pings as full', r.ok && r.scope === 'full', r);
  r = g.post(Object.assign({ secret: 'wrong', mode: 'draft' }, EMAIL));
  ok('a wrong key is still refused', !r.ok && /Unauthorized/.test(r.error), r);
  ok('a refused send is written to the log', g.calls.logs.some(l => /REFUSED send/.test(l)), g.calls.logs);
}

/* ---- 3. a badly set draft-only key never weakens anything ---- */
{
  let g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: 'short' });
  let r = g.post({ secret: 'short', mode: 'ping' });
  ok('a draft-only key under 16 characters is ignored', !r.ok && /Unauthorized/.test(r.error), r);

  g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: FULL });
  r = g.post(Object.assign({ secret: FULL, mode: 'send' }, EMAIL));
  ok('if both properties hold the same value it stays a full key', r.ok && r.scope === 'full' && g.calls.sent.length === 1, r);

  g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: '' });
  r = g.post({ secret: '', mode: 'ping' });
  ok('an empty draft-only key does not let an empty secret in', !r.ok, r);

  g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: '   ' + DRAFT + '  ' });
  r = g.post({ secret: DRAFT, mode: 'ping' });
  ok('stray spaces around the saved draft-only key are forgiven', r.ok && r.scope === 'draft', r);

  g = gateway({ GATEWAY_DRAFT_SECRET: DRAFT });
  r = g.post({ secret: DRAFT, mode: 'ping' });
  ok('with no full key set the gateway stays closed', !r.ok && /GATEWAY_SECRET is not set/.test(r.error), r);
}

/* ---- 4. the agency-only key (the website's own forms, e.g. the After an Accident report) ---- */
{
  const AGENCY = 'agency-key-for-tests-0123456789abcdef';
  const g = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: DRAFT, GATEWAY_AGENCY_SECRET: AGENCY });
  const REPORT = { subject: 'ACCIDENT - test', html: '<!doctype html><html><body><p>report</p></body></html>' };
  let r = g.post({ secret: AGENCY, mode: 'ping' });
  ok('agency-only key: ping works and says scope agency', r.ok && r.scope === 'agency', r);
  r = g.post(Object.assign({ secret: AGENCY, mode: 'send', to: 'docs@BillLayneInsurance.com', replyTo: 'customer@example.invalid' }, REPORT));
  ok('agency-only key: sends to the agency inbox (default BCC Save@, customer as reply-to)', r.ok && r.mode === 'send' && r.scope === 'agency' && g.calls.sent.length === 1 &&
    g.calls.sent[0].options.bcc === 'Save@BillLayneInsurance.com' && g.calls.sent[0].options.replyTo === 'customer@example.invalid', r);
  r = g.post(Object.assign({ secret: AGENCY, mode: 'send', to: 'Docs Desk <docs@billlayneinsurance.com>, save@BILLLAYNEINSURANCE.COM' }, REPORT));
  ok('agency-only key: several agency addresses, any letter case, with a display name', r.ok && g.calls.sent.length === 2, r);

  const outside = [
    ['a customer address', { to: 'customer@example.invalid' }],
    ['an agency address plus an outsider', { to: 'docs@billlayneinsurance.com, customer@example.invalid' }],
    ['an outsider in CC', { to: 'docs@billlayneinsurance.com', cc: 'customer@example.invalid' }],
    ['an outsider in BCC', { to: 'docs@billlayneinsurance.com', bcc: 'customer@example.invalid' }],
    ['a look-alike domain', { to: 'docs@billlayneinsurance.com.example.invalid' }],
    ['a look-alike domain (prefix)', { to: 'docs@notbilllayneinsurance.com' }],
    ['an agency name wrapped around an outside address', { to: 'docs@billlayneinsurance.com <customer@example.invalid>' }],
    ['two @ signs', { to: 'customer@example.invalid@billlayneinsurance.com' }],
    ['a second line smuggled into To', { to: 'docs@billlayneinsurance.com\nBcc: customer@example.invalid' }],
    ['no recipient at all', {}],
  ];
  for (const [label, fields] of outside) {
    const before = g.calls.sent.length + g.calls.drafts.length;
    for (const mode of ['send', 'draft']) {
      r = g.post(Object.assign({ secret: AGENCY, mode }, REPORT, fields));
      ok('agency-only key: ' + mode + ' refused for ' + label, !r.ok && g.calls.sent.length + g.calls.drafts.length === before, r);
    }
  }
  r = g.post(Object.assign({ secret: AGENCY, mode: 'send', to: 'docs@billlayneinsurance.com', bcc: '' }, REPORT));
  ok('agency-only key: an empty BCC is fine', r.ok, r);
  r = g.post(Object.assign({ secret: DRAFT, mode: 'send', to: 'docs@billlayneinsurance.com' }, REPORT));
  ok('the draft-only key still cannot send, even to the agency', !r.ok && /only create drafts/.test(r.error), r);
  r = g.post(Object.assign({ secret: FULL, mode: 'send', to: 'customer@example.invalid' }, REPORT));
  ok('the full key still reaches customers', r.ok && r.scope === 'full', r);

  let g2 = gateway({ GATEWAY_SECRET: FULL, GATEWAY_DRAFT_SECRET: DRAFT, GATEWAY_AGENCY_SECRET: DRAFT });
  r = g2.post(Object.assign({ secret: DRAFT, mode: 'send', to: 'docs@billlayneinsurance.com' }, REPORT));
  ok('if the agency-only key is a copy of the draft-only key it stays draft-only', !r.ok && g2.calls.sent.length === 0, r);
  g2 = gateway({ GATEWAY_SECRET: FULL, GATEWAY_AGENCY_SECRET: FULL });
  r = g2.post({ secret: FULL, mode: 'ping' });
  ok('if the agency-only key is a copy of the full key it stays full', r.ok && r.scope === 'full', r);
  g2 = gateway({ GATEWAY_SECRET: FULL, GATEWAY_AGENCY_SECRET: 'short' });
  r = g2.post({ secret: 'short', mode: 'ping' });
  ok('an agency-only key under 16 characters is ignored', !r.ok, r);
}

const failed = results.filter(r => !r.pass);
console.log('\n' + (failed.length ? 'FAILED ' + failed.length + ' of ' : 'PASS: all ') + results.length + ' checks');
process.exit(failed.length ? 1 : 0);
