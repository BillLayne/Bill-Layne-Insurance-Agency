/**
 * mail.billlayneinsurance.com - the BLI Mail Gateway pages on their own address.
 *
 * Serves the pages in /mail-gateway (Universal Sender, Mail Studio, Receipt Builder) and
 * nothing else, each with the strict headers in site-rules.mjs. No data is stored here and
 * there are no secrets in this Worker: the gateway key lives in the browser's storage for
 * this address, and email goes straight from the browser to the Google script.
 *
 * Deploy: tools\deploy-mail-site.bat   (never automatic: pushing the repo does not deploy this)
 */
import { resolve, securityHeaders, isLocalHost } from './site-rules.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const local = isLocalHost(url.hostname);
    const plain = (text, status, extra) => new Response(text, { status, headers: Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, securityHeaders('other', local), extra || {}) });

    if (request.method !== 'GET' && request.method !== 'HEAD') return plain('Method not allowed', 405, { Allow: 'GET, HEAD' });

    const rule = resolve(url.pathname);
    if (rule.redirect) return plain('Moved', 301, { Location: url.origin + rule.redirect + url.search });
    if (!rule.asset) return plain('Not found', 404);

    const upstream = await env.ASSETS.fetch(new Request(url.origin + rule.asset, { method: request.method, headers: request.headers }));
    if (upstream.status !== 200 && upstream.status !== 304) return plain('Not found', 404);
    const res = new Response(upstream.body, upstream);
    const headers = securityHeaders(rule.kind, local);
    for (const name of Object.keys(headers)) res.headers.set(name, headers[name]);
    return res;
  },
};
