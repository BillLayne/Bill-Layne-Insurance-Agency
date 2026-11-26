/*
 * Old-address bridge for the BLI Mail Gateway pages (2026-11-26).
 *
 * The mail tools moved from www.billlayneinsurance.com/mail-gateway/ to their own
 * address, https://mail.billlayneinsurance.com/. On the public website the key that
 * sends email sat in storage that every page and every outside script on the site
 * could read. The new address serves nothing but these tools, with a strict policy.
 *
 * This file is loaded first by index.html, studio.html and receipt.html.
 *   - On the NEW address (or a local / preview copy) it does nothing.
 *   - On the OLD address the page no longer runs. Old bookmarks, launcher files and
 *     hand-off links are passed on to the new address with their #... part intact.
 *     If this browser still holds a saved connection, the person is offered ONE
 *     click to carry it across (the new page then asks before it saves anything).
 *
 * The key is never posted anywhere from here. It only rides in the link fragment,
 * which browsers do not send to any server, and the new page scrubs it on arrival.
 */
(function () {
  'use strict';
  var NEW_ORIGIN = 'https://mail.billlayneinsurance.com';
  var host = String(location.hostname || '').toLowerCase();
  if (host !== 'www.billlayneinsurance.com' && host !== 'billlayneinsurance.com') return;

  window.__bliMailMoved = true;                       // sender.js / studio.js / receipt.js stop on this
  try { document.documentElement.style.visibility = 'hidden'; } catch (e) {}

  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  var page = location.pathname.replace(/^.*\/mail-gateway\/?/, '').replace(/\.html$/, '').replace(/\/+$/, '');
  var path = page === 'studio' ? '/studio.html' : page === 'receipt' ? '/receipt.html' : '/';
  var hash = location.hash || '';
  var plainTarget = NEW_ORIGIN + path + location.search + hash;

  var GW_URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
  var u = ls('bliMailGateway.url').trim(), s = ls('bliMailGateway.secret').trim();
  var carried = ls('bliMailGateway.movedAt');
  if (!u || !s || carried || !GW_URL_RE.test(u)) {
    location.replace(plainTarget);                    // nothing to carry: just go
    return;
  }

  // A saved connection is here and has not been carried yet: offer it once.
  function carryTarget() {
    var json = JSON.stringify({ u: u, s: s });
    var enc = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // The connection is saved by the Universal Sender page. A hand-off email (#z=) rides along.
    var keep = (path === '/' && hash.indexOf('#z=') === 0) ? hash + '&gw=' + enc : '#gw=' + enc;
    return NEW_ORIGIN + '/' + location.search + keep;
  }
  function show() {
    var b = document.body;
    b.innerHTML = '';
    b.style.cssText = 'margin:0;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#0f172a';
    var card = document.createElement('main');
    card.id = 'movedCard';
    card.style.cssText = 'box-sizing:border-box;max-width:560px;width:calc(100% - 32px);margin:8vh auto;background:#fff;border-radius:14px;padding:28px 26px;box-shadow:0 10px 30px rgba(15,23,42,.12);line-height:1.5;font-size:15.5px';
    var h = document.createElement('h1');
    h.style.cssText = 'margin:0 0 10px;font-size:22px;color:#003f87';
    h.textContent = 'The Mail Gateway has moved';
    var p1 = document.createElement('p');
    p1.style.cssText = 'margin:0 0 10px';
    p1.textContent = 'It now has its own address, mail.billlayneinsurance.com, away from the public website. That keeps the key that sends email safer.';
    var p2 = document.createElement('p');
    p2.style.cssText = 'margin:0 0 18px';
    p2.textContent = 'This browser is still connected at the old address. One click carries the connection across. On the next screen, click "Yes, connect this browser".';
    var go = document.createElement('button');
    go.type = 'button'; go.id = 'movedConnect';
    go.textContent = 'Connect this browser and open it';
    go.style.cssText = 'display:block;width:100%;padding:13px 16px;border:0;border-radius:10px;background:#003f87;color:#fff;font-size:16px;font-weight:700;cursor:pointer';
    go.onclick = function () {
      try { localStorage.setItem('bliMailGateway.movedAt', new Date().toISOString()); } catch (e) {}
      location.replace(carryTarget());
    };
    var skip = document.createElement('a');
    skip.id = 'movedSkip';
    skip.href = plainTarget;
    skip.textContent = 'Open it without connecting';
    skip.style.cssText = 'display:block;margin-top:14px;text-align:center;color:#475569;font-size:14px';
    var p3 = document.createElement('p');
    p3.style.cssText = 'margin:18px 0 0;font-size:13px;color:#475569';
    p3.textContent = (path === '/' ? '' : 'After you connect, open ' + (page === 'studio' ? 'Mail Studio' : 'Receipt Builder') + ' again from the new page. ') + 'Update your bookmark to the new address when you get there.';
    card.appendChild(h); card.appendChild(p1); card.appendChild(p2); card.appendChild(go); card.appendChild(skip); card.appendChild(p3);
    b.appendChild(card);
    document.title = 'The Mail Gateway has moved';
    document.documentElement.style.visibility = '';
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
