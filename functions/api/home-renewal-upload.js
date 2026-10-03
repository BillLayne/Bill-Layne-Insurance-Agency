// Validate renewal uploads before forwarding them to the existing policy intake.
const BACKEND = 'https://script.google.com/macros/s/AKfycbwNgkzMPDQy2RFv9WI3kAOpk-pMdnPvr5pLa3Ex_aZqG03CUpJNT9mpd3L0eJAffNpB/exec';
const MAX_BODY = 30 * 1024 * 1024;
const MAX_FILE = 8 * 1024 * 1024;
const MAX_TOTAL = 12 * 1024 * 1024;
const reply = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

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
    if (size > MAX_BODY) {
      await reader.cancel();
      throw new Error('too-large');
    }
    raw += decoder.decode(value, { stream: true });
  }
  return raw + decoder.decode();
}

export async function onRequest({ request }) {
  if (request.method !== 'POST') return reply({ ok: false }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ ok: false }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ ok: false }, 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) return reply({ ok: false }, 413);

  let payload;
  try {
    const raw = await readLimited(request);
    const data = JSON.parse(raw);
    const field = (key, max, required = false) => {
      const value = data?.[key] ?? '';
      if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('invalid');
      return value.trim();
    };
    if (data?.formType !== 'policy-upload' || data?.policyType !== 'home' ||
        !Array.isArray(data.files) || data.files.length < 1 || data.files.length > 6) throw new Error('invalid');
    const email = field('email', 254, true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('invalid');
    let total = 0;
    const files = data.files.map(file => {
      if (!file || typeof file.name !== 'string' || file.name.length > 200 ||
          typeof file.type !== 'string' || file.type.length > 100 ||
          !/^(application\/pdf|image\/(jpeg|png|heic|heif|webp))$/.test(file.type) ||
          typeof file.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(file.base64)) throw new Error('invalid');
      const bytes = Math.floor(file.base64.length * 3 / 4) - (file.base64.endsWith('==') ? 2 : file.base64.endsWith('=') ? 1 : 0);
      if (bytes < 1 || bytes > MAX_FILE) throw new Error('invalid');
      total += bytes;
      return { name: file.name, type: file.type, sizeKB: Math.max(1, Math.round(bytes / 1024)), base64: file.base64 };
    });
    if (total > MAX_TOTAL) return reply({ ok: false }, 413);
    payload = {
      formType: 'policy-upload', name: field('name', 150, true), phone: field('phone', 50, true), email,
      policyType: 'home', currentCarrier: field('currentCarrier', 150), renewalDate: field('renewalDate', 80),
      notes: field('notes', 6000), source: 'upload-policy-page', files,
      fileName: files[0].name, fileType: files[0].type, fileSizeKB: files[0].sizeKB, fileBase64: files[0].base64
    };
  } catch (error) { return reply({ ok: false }, error.message === 'too-large' ? 413 : 400); }

  try {
    const upstream = await fetch(BACKEND, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(60000)
    });
    const result = await upstream.json();
    if (!upstream.ok || result?.status !== 'success' || result.formType !== 'policy-upload') {
      return reply({ ok: false, status: 'unconfirmed' }, 502);
    }
    return reply({ ok: true, formType: 'policy-upload' }, 200);
  } catch { return reply({ ok: false, status: 'unconfirmed' }, 502); }
}
