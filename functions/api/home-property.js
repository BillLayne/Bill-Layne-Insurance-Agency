// Optional, same-origin public-record assistance. Quote submission never depends on this route.
const ENDPOINT = 'https://find-my-home-information.pages.dev/api/property';
const reply = (body, status = 200) => Response.json(body, { status, headers: {
    'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff'
} });
const text = (value, max = 160) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
const numeric = (value, min, max) => {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export function publicMatches(payload) {
    if (!payload || !Array.isArray(payload.results)) throw new Error('Invalid property response');
    // Deliberately omit owner names, valuations, coordinates, arbitrary links and private details.
    return payload.results.slice(0, 20).filter(p => p && p.hasCountyRecord === true &&
        text(p.officialAddress) && (text(p.parcelId) || text(p.pin))).map(p => ({
        address: text(p.officialAddress, 250), county: text(p.county, 50),
        parcel: text(p.parcelId) || text(p.pin), addressDiffers: p.recordAddressDiffers !== false,
        yearBuilt: numeric(p.yearBuilt, 1700, new Date().getFullYear()),
        heatedArea: numeric(p.heatedArea, 1, 100000),
        roofCover: text(p.roofCover), exteriorWall: text(p.exteriorWall)
    }));
}

export async function handleLookup({ request, env = {} }, fetcher = fetch) {
    if (request.method !== 'POST') return reply({ error: 'Use POST.' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Origin not allowed.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Use JSON.' }, 415);
    if (env.HOME_PROPERTY_LOOKUP_DISABLED === 'true') return reply({ disabled: true }, 503);
    let address;
    try {
        if (Number(request.headers.get('content-length')) > 1024) return reply({ error: 'Request too large.' }, 413);
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > 1024) return reply({ error: 'Request too large.' }, 413);
        const data = JSON.parse(raw);
        if (!data || Array.isArray(data) || Object.keys(data).some(k => k !== 'address') || typeof data.address !== 'string') throw new Error();
        address = data.address.replace(/\s+/g, ' ').trim();
        if (address.length < 8 || address.length > 180 || !/\d/.test(address) || !/[a-z]/i.test(address)) throw new Error();
    } catch { return reply({ error: 'Enter a complete North Carolina street address.' }, 400); }
    // Optional Cloudflare rate-limit binding. Also protect this public route with a zone rate-limit rule.
    if (env.HOME_PROPERTY_RATE_LIMITER) {
        const { success } = await env.HOME_PROPERTY_RATE_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
        if (!success) return reply({ error: 'Please continue manually or try again later.' }, 429);
    }
    try {
        const response = await fetcher(ENDPOINT, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }), signal: AbortSignal.timeout(18000)
        });
        if (!response.ok) return reply({ error: 'Property details are unavailable.' }, 502);
        return reply({ matches: publicMatches(await response.json()), retrievedAt: new Date().toISOString() });
    } catch { return reply({ error: 'Property details are unavailable.' }, 502); }
}

export const onRequest = context => handleLookup(context);
