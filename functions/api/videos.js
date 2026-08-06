// GET /api/videos — latest uploads from the @ncautoandhome YouTube channel.
// Cloudflare Pages Function. Proxies YouTube's public RSS feed (which the
// browser cannot fetch directly because of CORS) and returns lightweight JSON
// the videos page renders as the "Latest from our channel" grid. Edge-cached
// for an hour, so YouTube sees at most ~24 hits/day regardless of traffic.
const CHANNEL_ID = 'UC8a1ZIuaAxllNe49DrNftew';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_KEY = 'https://cache.billlayneinsurance.com/api/videos-v1';

function decodeXml(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(CACHE_KEY);
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let videos = [];
  try {
    const feed = await fetch(FEED, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; BillLayneInsurance videos page)' },
    });
    if (feed.ok) {
      const xml = await feed.text();
      videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
        const e = m[1];
        const pick = (re) => { const x = e.match(re); return x ? x[1] : ''; };
        return {
          id: pick(/<yt:videoId>([^<]+)/),
          title: decodeXml(pick(/<title>([^<]+)/)),
          published: pick(/<published>([^<]+)/),
        };
      }).filter((v) => /^[A-Za-z0-9_-]{6,}$/.test(v.id) && v.title);
    }
  } catch (e) { /* fall through with empty list; page shows its fallback */ }

  const res = new Response(JSON.stringify({ videos, channel: CHANNEL_ID }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Browsers revalidate after 15 min; the edge keeps it for 1 h.
      'cache-control': 'public, max-age=900, s-maxage=3600',
      'access-control-allow-origin': '*',
    },
  });
  if (videos.length) context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
