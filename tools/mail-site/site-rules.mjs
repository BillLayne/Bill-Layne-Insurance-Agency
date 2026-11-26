/**
 * mail.billlayneinsurance.com - what is served and with which headers.
 *
 * ONE source of truth, used by the Worker (worker.js) and by the tests
 * (tools/mail-gateway-tests/smoke.js), so the tests exercise the real policy.
 *
 * The whole point of this address: the key that sends email lives in this origin's
 * storage, so nothing may run here except the mail tools' own scripts.
 *   - script-src 'self'      no inline script, no outside script, no eval
 *   - connect-src            the Google script (and its redirect host), plus the website's
 *                            own health check for the After an Accident report
 *   - frame-ancestors 'none' the pages cannot be framed (no click-jacking of Send Now)
 * Styles stay 'unsafe-inline' because the tools preview finished emails, and emails are
 * built from inline styles. A style cannot read storage.
 */

// Only these paths exist. Everything else is a 404, including the docs that sit in the same folder.
const PAGES = {
  '/': '/index.html', '/index.html': '/index.html',
  '/studio': '/studio.html', '/studio.html': '/studio.html',
  '/receipt': '/receipt.html', '/receipt.html': '/receipt.html',
};
const SCRIPTS = new Set(['/moved.js', '/sender.js', '/studio.js', '/receipt.js', '/studio-templates.js', '/receipt-template.js']);

/** What to do with a request path: { asset, kind } | { redirect } | { status: 404 } */
export function resolve(pathname) {
  // old-style paths keep working on the new address: /mail-gateway/studio.html -> /studio.html
  if (pathname === '/mail-gateway' || pathname.startsWith('/mail-gateway/')) {
    return { redirect: pathname.slice('/mail-gateway'.length) || '/' };
  }
  if (Object.prototype.hasOwnProperty.call(PAGES, pathname)) return { asset: PAGES[pathname], kind: 'html' };
  if (SCRIPTS.has(pathname)) return { asset: pathname, kind: 'js' };
  return { status: 404 };
}

export function contentSecurityPolicy(local) {
  // local = the site is running on this computer (wrangler dev / the tests), where the
  // "gateway" is a mock on 127.0.0.1. Never true on the real address.
  const connect = ['https://script.google.com', 'https://script.googleusercontent.com', 'https://www.billlayneinsurance.com']
    .concat(local ? ['http://127.0.0.1:*', 'http://localhost:*'] : []);
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'img-src https: data: blob:',
    'font-src https: data:',
    'media-src https: data:',
    'connect-src ' + connect.join(' '),
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ');
}

/** Headers for every response. kind: 'html' | 'js' | 'other' */
export function securityHeaders(kind, local) {
  const h = {
    'Content-Security-Policy': contentSecurityPolicy(!!local),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-read=(self), clipboard-write=(self)',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    // no-transform: Cloudflare must not rewrite these pages (email obfuscation, injected scripts)
    'Cache-Control': kind === 'js' ? 'no-cache, no-transform' : 'no-store, no-transform',
  };
  if (!local) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  return h;
}

export const isLocalHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1';
