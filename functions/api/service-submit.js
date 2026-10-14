// The deployed Contact Form Handler accepts these form types through its generic
// mail handler and acknowledges only after MailApp.sendEmail returns.
const BACKEND = 'https://script.google.com/macros/s/AKfycbwNgkzMPDQy2RFv9WI3kAOpk-pMdnPvr5pLa3Ex_aZqG03CUpJNT9mpd3L0eJAffNpB/exec';
const MAX_BYTES = 16000;
const CHANGE_TYPES = new Set(['Add Vehicle', 'Remove Vehicle', 'Replace Vehicle', 'Add Driver', 'Remove Driver', 'Address Change', 'Coverage Change', 'Add Lender/Lienholder', 'Remove Lender/Lienholder', 'Cancel Policy', 'Other']);
const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function readPayload(request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  let size = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new RangeError(); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function onRequest({ request }) {
  if (request.method !== 'POST') return reply({ ok: false }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ ok: false }, 403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return reply({ ok: false }, 415);
  let payload;
  try {
    const data = await readPayload(request);
    if (!data || !['policy-change', 'id-card'].includes(data.formType)) throw new Error('invalid');
    const field = (key, max, required = false, multiline = false) => {
      const value = data[key] ?? '';
      if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || (!multiline && /[\r\n]/.test(value))) throw new Error('invalid');
      return value.trim();
    };
    const name = field('name', 150, true);
    const phone = field('phone', 50, true);
    if (!/^(?:1)?\d{10}$/.test(phone.replace(/\D/g, ''))) throw new Error('invalid');
    const email = field('email', 254);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid');
    const policyNumber = field('policyNumber', 100);
    let message = 'Policy number: ' + (policyNumber || 'Not provided') + '\n';
    if (data.formType === 'policy-change') {
      const changeType = field('changeType', 80, true);
      if (!CHANGE_TYPES.has(changeType)) throw new Error('invalid');
      message += 'Type of change: ' + changeType + '\n\nDetails:\n' + field('details', 5000, true, true);
      message += '\n\nRequest only. Coverage changes require confirmation from an authorized agent or carrier.';
    } else {
      const deliveryMethod = field('deliveryMethod', 30, true);
      if (!['Email', 'Text Message'].includes(deliveryMethod) || (deliveryMethod === 'Email' && !email)) throw new Error('invalid');
      message += 'Delivery method: ' + deliveryMethod + '\n\nNotes:\n' + (field('notes', 2000, false, true) || 'None');
      message += '\n\nID card requested for office review. This submission does not issue an ID card.';
    }
    // Map every service-specific field into the deployed handler's message field.
    payload = { formType: data.formType, name, phone, email, message, source: 'service-center' };
  } catch (error) {
    return reply({ ok: false, status: 'invalid' }, error instanceof RangeError ? 413 : 400);
  }

  try {
    const upstream = await fetch(BACKEND, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(45000)
    });
    const result = await upstream.json();
    if (!upstream.ok || result?.status !== 'success' || result.formType !== payload.formType) return reply({ ok: false, status: 'unconfirmed' }, 502);
    return reply({ ok: true, formType: payload.formType }, 200);
  } catch { return reply({ ok: false, status: 'unconfirmed' }, 502); }
}
