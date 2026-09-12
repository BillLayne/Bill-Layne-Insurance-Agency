// Same-origin acknowledgment bridge to the existing Apps Script intake.
// Never retry a POST: the backend may have saved it before a response was lost.
const BACKEND = 'https://script.google.com/macros/s/AKfycbw8Ewng1HqFoK31Ch7Ytn6Ux_V5KNDrtPjK9bthB21NSaWStmpj3Q-8mJUNm-meccihNQ/exec';
const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function onRequest({ request }) {
  if (request.method !== 'POST') return reply({ ok: false }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ ok: false }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ ok: false }, 415);
  let data;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 100000) return reply({ ok: false }, 413);
    data = JSON.parse(raw);
    if (!data || !['auto_insurance', 'home_insurance'].includes(data.form_type)) return reply({ ok: false }, 400);
  } catch { return reply({ ok: false }, 400); }

  try {
    const upstream = await fetch(BACKEND, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), redirect: 'follow', signal: AbortSignal.timeout(45000)
    });
    const result = await upstream.json();
    const type = data.form_type === 'auto_insurance' ? 'AUTO' : 'HOME';
    if (!upstream.ok || result.ok !== true || result.quoteType !== type ||
        typeof result.confirmationNumber !== 'string' ||
        !new RegExp('^' + type + '-[0-9]{6}-[A-Z0-9]{4}$').test(result.confirmationNumber)) {
      return reply({ ok: false, status: 'unconfirmed' }, 502);
    }
    // Do not expose backend errors, request contents, or customer data.
    return reply({ ok: true, quoteType: type, confirmationNumber: result.confirmationNumber }, 200);
  } catch { return reply({ ok: false, status: 'unconfirmed' }, 502); }
}
