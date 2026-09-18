// Read the existing Apps Script acknowledgment; never retry an uncertain POST.
const BACKEND = 'https://script.google.com/macros/s/AKfycbwNgkzMPDQy2RFv9WI3kAOpk-pMdnPvr5pLa3Ex_aZqG03CUpJNT9mpd3L0eJAffNpB/exec';
const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function onRequest({ request }) {
  if (request.method !== 'POST') return reply({ ok: false }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ ok: false }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ ok: false }, 415);
  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 20000) return reply({ ok: false }, 413);
    const data = JSON.parse(raw);
    if (!data || !['contact', 'newsletter'].includes(data.formType)) return reply({ ok: false }, 400);
    const field = (key, max, required = false) => {
      const value = data[key] ?? '';
      if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('invalid');
      return value.trim();
    };
    const email = field('email', 254, data.formType === 'newsletter');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false }, 400);
    payload = data.formType === 'newsletter'
      ? { formType: 'newsletter', email, source: 'homepage-newsletter' }
      : { formType: 'contact', name: field('name', 150, true), phone: field('phone', 50, true), email, message: field('message', 5000, true) };
  } catch { return reply({ ok: false }, 400); }

  try {
    const upstream = await fetch(BACKEND, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(45000)
    });
    const result = await upstream.json();
    if (!upstream.ok || result?.status !== 'success' || result.formType !== payload.formType) {
      return reply({ ok: false, status: 'unconfirmed' }, 502);
    }
    // Backend acceptance is not proof of inbox delivery or newsletter enrollment.
    return reply({ ok: true, formType: payload.formType }, 200);
  } catch { return reply({ ok: false, status: 'unconfirmed' }, 502); }
}
