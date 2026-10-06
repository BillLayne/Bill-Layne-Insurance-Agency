// Accident Helper (/accident/) -> agency inbox. Validates the report, emails it through the
// BLI Mail Gateway (Apps Script, direct send with attachments) and texts the office line via
// Twilio when those secrets exist. Nothing is stored here; a report is confirmed only after the
// gateway reports the send and the attachment count.
//
// Pages env vars (Settings > Environment variables, Production):
//   BLI_MAIL_GATEWAY_URL     the gateway /exec URL          (required)
//   BLI_MAIL_GATEWAY_SECRET  the gateway GATEWAY_SECRET     (required)
//   ACCIDENT_REPORT_TO       inbox, default docs@BillLayneInsurance.com
//   TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, ACCIDENT_SMS_TO   (optional; text alert on part 1)
const MAX_BODY = 30 * 1024 * 1024;
const MAX_FILE = 8 * 1024 * 1024;
const MAX_TOTAL = 12 * 1024 * 1024;
const MAX_FILES = 5; // the gateway attaches at most 5 per email
const MAX_SUMMARY = 20000;
const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

async function readLimited(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const decoder = new TextDecoder();
  let raw = '';
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error('too-large'); }
    raw += decoder.decode(value, { stream: true });
  }
  return raw + decoder.decode();
}

// Gmail corrupts astral characters; everything non-ASCII goes out as a numeric entity.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  .replace(/[^\x00-\x7F]/gu, c => '&#x' + c.codePointAt(0).toString(16) + ';');
const ascii = s => String(s).replace(/[\u{10000}-\u{10FFFF}]/gu, '').replace(/[\r\n]+/g, ' ').trim();
const digits = s => String(s).replace(/[^0-9+]/g, '');

function emailHtml(p) {
  const row = (label, v) => v ? `<tr><td style="padding:6px 10px;color:#5a6779;font:600 13px Arial,sans-serif;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:6px 10px;font:14px Arial,sans-serif;color:#1c2b41">${esc(v)}</td></tr>` : '';
  const files = p.files.length ? `<p style="font:13px Arial,sans-serif;color:#5a6779;margin:14px 0 0">Attached: ${p.files.map(f => esc(f.name)).join(', ')}</p>` : '';
  const part = p.parts > 1 ? ` (part ${p.part} of ${p.parts})` : '';
  return `<!doctype html><html><body style="margin:0;background:#f2f0ea;padding:20px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #dfe3ea;border-radius:12px"><tr><td style="background:#0F2A4D;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;font:800 20px Arial,sans-serif">Accident report ${esc(p.ref)}${esc(part)}</td></tr><tr><td style="padding:16px 12px 6px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${row('Name', p.name)}${row('Phone', p.phone)}${row('Email', p.email)}${row('Customer', p.customer)}${row('Insurer', p.insurer)}${row('Anyone hurt', p.hurt)}${row('Drivable', p.drivable)}${row('Location', p.county)}</table></td></tr>${p.summary ? `<tr><td style="padding:6px 22px 18px"><pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;font:14px/1.5 Arial,sans-serif;color:#1c2b41">${esc(p.summary)}</pre>${files}</td></tr>` : `<tr><td style="padding:6px 22px 18px;font:14px Arial,sans-serif;color:#1c2b41">More photos for this report.${files}</td></tr>`}<tr><td style="padding:12px 22px;border-top:1px solid #dfe3ea;font:12px Arial,sans-serif;color:#5a6779">Sent from the Accident Helper at billlayneinsurance.com/accident. The customer was told this does not open a claim.</td></tr></table></td></tr></table></body></html>`;
}

async function sendSms(env, p, fetcher) {
  if (!env.TWILIO_SID || !env.TWILIO_TOKEN || !env.TWILIO_FROM || !env.ACCIDENT_SMS_TO) return 'skipped';
  const body = ascii(['ACCIDENT REPORT', p.name, p.phone, p.county, 'hurt: ' + (p.hurt || '?'), 'drivable: ' + (p.drivable || '?'), p.ref, 'details in docs@'].filter(Boolean).join(' / ')).slice(0, 300);
  try {
    const r = await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_SID)}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: 'Basic ' + btoa(env.TWILIO_SID + ':' + env.TWILIO_TOKEN), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: env.ACCIDENT_SMS_TO, From: env.TWILIO_FROM, Body: body }),
      signal: AbortSignal.timeout(15000)
    });
    return r.ok ? 'sent' : 'failed';
  } catch { return 'failed'; }
}

export async function handleAccidentReport({ request, env = {} }, fetcher = fetch) {
  if (request.method !== 'POST') return reply({ ok: false }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ ok: false }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ ok: false }, 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) return reply({ ok: false }, 413);
  if (!env.BLI_MAIL_GATEWAY_URL || !env.BLI_MAIL_GATEWAY_SECRET) return reply({ ok: false, status: 'not-connected' }, 503);

  let p;
  try {
    const data = JSON.parse(await readLimited(request));
    const field = (key, max, required = false) => {
      const value = data?.[key] ?? '';
      if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('invalid');
      return value.trim();
    };
    if (data?.formType !== 'accident-report') throw new Error('invalid');
    const ref = field('ref', 20, true);
    if (!/^ACC-\d{6}-[A-Z0-9]{4}$/.test(ref)) throw new Error('invalid');
    const part = Number(data.part), parts = Number(data.parts);
    if (!Number.isInteger(part) || !Number.isInteger(parts) || part < 1 || parts < 1 || part > parts || parts > 20) throw new Error('invalid');
    const email = field('email', 254);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid');
    const list = data.files ?? [];
    if (!Array.isArray(list) || list.length > MAX_FILES) throw new Error('invalid');
    let total = 0;
    const files = list.map(f => {
      if (!f || typeof f.name !== 'string' || f.name.length > 200 || typeof f.type !== 'string' ||
          !/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) || typeof f.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(f.base64)) throw new Error('invalid');
      const bytes = Math.floor(f.base64.length * 3 / 4) - (f.base64.endsWith('==') ? 2 : f.base64.endsWith('=') ? 1 : 0);
      if (bytes < 1 || bytes > MAX_FILE) throw new Error('invalid');
      total += bytes;
      return { name: f.name.replace(/[^A-Za-z0-9._-]/g, '_'), type: f.type, base64: f.base64 };
    });
    if (total > MAX_TOTAL) return reply({ ok: false }, 413);
    const summary = field('summary', MAX_SUMMARY, part === 1);
    p = {
      ref, part, parts, name: field('name', 150, true), phone: field('phone', 50, true), email,
      customer: field('customer', 20), insurer: field('insurer', 150), hurt: field('hurt', 20), drivable: field('drivable', 20),
      county: field('county', 200), summary, files
    };
  } catch (error) { return reply({ ok: false }, error.message === 'too-large' ? 413 : 400); }

  const date = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  const subject = ascii(`ACCIDENT - ${p.name} - ${date} - ${p.ref}` + (p.parts > 1 ? ` (part ${p.part} of ${p.parts})` : ''));
  const message = {
    secret: env.BLI_MAIL_GATEWAY_SECRET, mode: 'send', to: env.ACCIDENT_REPORT_TO || 'docs@BillLayneInsurance.com',
    subject, html: emailHtml(p), fromName: 'Accident Helper - Bill Layne Insurance',
    attachments: p.files.map(f => ({ name: f.name, mimeType: f.type, dataB64: f.base64 }))
  };
  if (p.email) message.replyTo = p.email;

  let result;
  try {
    const upstream = await fetcher(env.BLI_MAIL_GATEWAY_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(message),
      redirect: 'follow', signal: AbortSignal.timeout(60000)
    });
    result = await upstream.json();
    if (!upstream.ok || result?.ok !== true || result.mode !== 'send' || Number(result.attached) !== p.files.length) {
      return reply({ ok: false, status: 'unconfirmed' }, 502);
    }
  } catch { return reply({ ok: false, status: 'unconfirmed' }, 502); }

  const sms = p.part === 1 ? await sendSms(env, p, fetcher) : 'skipped';
  return reply({ ok: true, ref: p.ref, part: p.part, parts: p.parts, sms }, 200);
}

export const onRequest = context => handleAccidentReport(context);
