/**
 * BLI Mail Gateway — drop-in client (v1.4) for any BLI tool.
 *
 * Paste this file's contents into a <script> tag (or include the file) in any
 * template app, then call bliMail(...) from a "Draft in Gmail" or "Send" button.
 *
 * Features included automatically:
 * - Reads `bliMailGateway.url` + `bliMailGateway.secret` from localStorage
 * - Supports `#gw=<base64url({u,s})>` setup links. v1.4: a link is never saved
 *   by itself. It must carry BOTH values, the address must be a Google Apps
 *   Script web app, and the person is asked before anything is stored.
 * - v1.4: the secret is only ever posted to a Google Apps Script address
 *   (a local address is allowed only while the page itself runs locally)
 * - Inline non-blocking setup modal if Chrome blocks native prompt()
 * - Strips preview toolbars & executable scripts while keeping JSON-LD Schema.org
 * - Swaps base64 600px anti-fit spacers to hosted BLI CDN PNG
 * - Entity-encodes non-ASCII HTML & strips astral chars from subject (emoji-safe)
 * - 45s AbortController timeout + text/plain simple CORS POST + redirect follow
 * - Returns helper `bliGmailUrl(resp)` to open the exact created Gmail draft!
 */

(function (global) {
  'use strict';

  var LS_URL = 'bliMailGateway.url';
  var LS_SECRET = 'bliMailGateway.secret';
  var SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
  var DEFAULT_AUTHUSER = 'bill@billlayneinsurance.com';

  // The secret is only ever posted to a Google Apps Script web app. A local
  // address is accepted only while the page itself runs on this computer (tests).
  var GW_URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
  var ON_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function bliIsGatewayUrl(u) {
    u = String(u || '').trim();
    if (GW_URL_RE.test(u)) return true;
    return ON_LOCAL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);
  }
  var BAD_URL = 'The Gateway URL must be the Google Apps Script web app link (https://script.google.com/.../exec). Nothing was sent.';

  // Setup links (#gw=<base64url({u,s})>). A link used to be saved the moment a page
  // opened; one carrying only a different address then kept the saved secret, and the
  // next call posted that secret to the new address. Now: both values or nothing, a
  // Google script address or nothing, and the person is asked before anything is saved.
  function ingestHashSetup() {
    var m = /[#&]gw=([A-Za-z0-9_-]+)/.exec(location.hash || '');
    if (!m) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    var parsed = null;
    try {
      var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      parsed = JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) { parsed = null; }
    var u = (parsed && typeof parsed.u === 'string') ? parsed.u.trim() : '';
    var sec = (parsed && typeof parsed.s === 'string') ? parsed.s.trim() : '';
    if (!u || !sec || !bliIsGatewayUrl(u)) return;                       // not a gateway link: ignore, change nothing
    var curUrl = localStorage.getItem(LS_URL) || '';
    if (u === curUrl && sec === (localStorage.getItem(LS_SECRET) || '')) return;   // already connected to it
    var ask = function () { confirmSetup(u, sec, curUrl); };
    if (document.body) ask(); else document.addEventListener('DOMContentLoaded', ask);
  }

  function confirmSetup(u, sec, curUrl) {
    var tail = function (x) { var t = /\/s\/([A-Za-z0-9_-]+)\/exec$/.exec(x || ''); return t ? 'script.google.com \u2026' + t[1].slice(-6) : 'a local test address'; };
    var overlay = document.createElement('div');
    overlay.id = 'bliGwSetupAsk';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;max-width:470px;width:100%;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.25);color:#0f172a;font-size:13.5px;line-height:1.5';
    var h = document.createElement('h3');
    h.style.cssText = 'margin:0 0 8px;font-size:17px;color:#003f87';
    h.textContent = 'Connect this browser to the BLI Mail Gateway?';
    var p1 = document.createElement('p');
    p1.style.cssText = 'margin:0 0 8px';
    p1.textContent = 'A setup link wants to save a gateway address and secret here. Only say yes if you made this link yourself a moment ago. A link from an email, a text or a web page should be ignored.';
    var p2 = document.createElement('p');
    p2.style.cssText = 'margin:0 0 14px;color:#78350f;font-weight:600';
    p2.textContent = 'Gateway in the link: ' + tail(u) + (curUrl && curUrl !== u ? '. It would REPLACE the gateway saved here now (' + tail(curUrl) + ').' : '.');
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap';
    var no = document.createElement('button');
    no.type = 'button'; no.id = 'bliGwSetupNo'; no.textContent = 'No, ignore the link';
    no.style.cssText = 'padding:8px 14px;border-radius:8px;border:0;background:#e2e8f0;color:#0f172a;font-weight:600;cursor:pointer';
    var yes = document.createElement('button');
    yes.type = 'button'; yes.id = 'bliGwSetupYes'; yes.textContent = 'Yes, connect';
    yes.style.cssText = 'padding:8px 16px;border-radius:8px;border:0;background:#003f87;color:#fff;font-weight:700;cursor:pointer';
    var close = function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    no.onclick = close;
    yes.onclick = function () {
      localStorage.setItem(LS_URL, u);
      localStorage.setItem(LS_SECRET, sec);
      close();
      try { global.dispatchEvent(new CustomEvent('bli-gateway-connected')); } catch (e) {}
    };
    row.appendChild(no); row.appendChild(yes);
    box.appendChild(h); box.appendChild(p1); box.appendChild(p2); box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    no.focus();
  }
  ingestHashSetup();
  global.addEventListener('hashchange', ingestHashSetup);

  function bliCleanEmail(html) {
    if (!html) return '';
    var out = String(html);
    out = out.replace(/^\s*<!--\s*SUBJECT:[\s\S]*?-->\s*/i, '');
    out = out.replace(/<!--[^>]*PREVIEW TOOLBAR[^>]*-->\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']bli-send-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']preview-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
    out = out.replace(/<script\b(?![^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
    out = out.replace(/(<img\b[^>]*?\bsrc=["'])data:image\/png;base64,[A-Za-z0-9+\/=]+(["'][^>]*?\bwidth=["']600["'])/gi,
      function (_, a, b) { return a + SPACER_URL + b; });
    return out;
  }

  function bliAsciiHtml(html) {
    var out = '', i, cp;
    for (i = 0; i < html.length; i++) {
      cp = html.codePointAt(i);
      if (cp > 126) {
        out += '&#x' + cp.toString(16).toUpperCase() + ';';
        if (cp > 0xFFFF) i++;
      } else {
        out += html.charAt(i);
      }
    }
    return out;
  }

  function bliSafeSubject(s) {
    return String(s || '').replace(/[\uD800-\uDFFF]/g, '').replace(/\s+/g, ' ').trim();
  }

  function bliGmailUrl(resp) {
    var user = encodeURIComponent((resp && resp.senderEmail) || DEFAULT_AUTHUSER);
    var base = 'https://mail.google.com/mail/?authuser=' + user;
    if (resp && resp.mode === 'send') return base + '#sent';
    if (resp && resp.messageId) return base + '#drafts/' + encodeURIComponent(resp.messageId);
    return base + '#drafts';
  }

  // Inline setup dialog so Chrome's native-prompt blocker never prevents configuration
  function requestConfigModal(initialUrl) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif';
      overlay.innerHTML =
        '<div style="background:#fff;border-radius:12px;max-width:460px;width:100%;padding:20px;box-shadow:0 20px 40px rgba(0,0,0,.25);color:#0f172a">' +
          '<h3 style="margin:0 0 6px;font-size:17px;color:#003f87">Connect BLI Mail Gateway</h3>' +
          '<p style="margin:0 0 14px;font-size:13px;color:#475569">One-time setup for this browser origin. Saved only in localStorage.</p>' +
          '<label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:4px">Gateway URL (ends in /exec)</label>' +
          '<input id="bliGwModalUrl" type="text" placeholder="https://script.google.com/macros/s/.../exec" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:13.5px;margin-bottom:10px">' +
          '<label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:4px">Gateway Secret</label>' +
          '<input id="bliGwModalSec" type="password" placeholder="GATEWAY_SECRET" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:13.5px;margin-bottom:8px">' +
          '<div id="bliGwModalErr" role="alert" style="min-height:18px;margin-bottom:8px;font-size:12.5px;font-weight:600;color:#b91c1c"></div>' +
          '<div style="display:flex;gap:8px;justify-content:flex-end">' +
            '<button id="bliGwModalCancel" type="button" style="padding:8px 14px;border-radius:8px;border:0;background:#e2e8f0;color:#0f172a;font-weight:600;cursor:pointer">Cancel</button>' +
            '<button id="bliGwModalSave" type="button" style="padding:8px 16px;border-radius:8px;border:0;background:#003f87;color:#fff;font-weight:700;cursor:pointer">Save &amp; Continue</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      var uInput = overlay.querySelector('#bliGwModalUrl');
      var sInput = overlay.querySelector('#bliGwModalSec');
      uInput.value = initialUrl || '';
      (initialUrl ? sInput : uInput).focus();
      function close(res) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(res);
      }
      overlay.querySelector('#bliGwModalCancel').onclick = function () { close({ url: '', secret: '' }); };
      overlay.querySelector('#bliGwModalSave').onclick = function () {
        var u = uInput.value.trim(), s = sInput.value.trim();
        if (u && !bliIsGatewayUrl(u)) {   // never store an address the secret must not go to
          overlay.querySelector('#bliGwModalErr').textContent = BAD_URL;
          uInput.focus();
          return;
        }
        if (u) localStorage.setItem(LS_URL, u);
        if (s) localStorage.setItem(LS_SECRET, s);
        close({ url: u, secret: s });
      };
    });
  }

  async function bliMailConfig(force) {
    var url = (localStorage.getItem(LS_URL) || '').trim();
    var secret = (localStorage.getItem(LS_SECRET) || '').trim();
    if (force || !url || !secret) {
      if (typeof document !== 'undefined' && document.body) {
        return await requestConfigModal(url);
      }
    }
    return { url: url, secret: secret };
  }

  async function bliMail(payload) {
    var cfg = await bliMailConfig(false);
    if (!cfg.url || !cfg.secret) {
      throw new Error('Gateway setup cancelled — enter the gateway URL + secret to send or draft.');
    }
    if (!bliIsGatewayUrl(cfg.url)) throw new Error(BAD_URL);
    var reqBody = Object.assign({}, payload, { secret: cfg.secret });
    if (typeof reqBody.html === 'string') {
      reqBody.html = bliAsciiHtml(bliCleanEmail(reqBody.html));
    }
    if (typeof reqBody.subject === 'string') {
      reqBody.subject = bliSafeSubject(reqBody.subject);
    }

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 45000);
    var res;
    try {
      res = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(reqBody),
        redirect: 'follow',
        signal: ctrl.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (e && e.name === 'AbortError') {
        throw new Error('The gateway took too long to answer (45s). Please try again.');
      }
      throw new Error('Could not reach the gateway. Check the URL and your internet connection.');
    }
    clearTimeout(timer);

    var data = await res.json().catch(function () {
      return { ok: false, error: 'Gateway returned a bad response (HTTP ' + res.status + '). Is access set to "Anyone"?' };
    });
    if (!data.ok) throw new Error(data.error || 'Gateway error.');
    data.gmailUrl = bliGmailUrl(data);
    return data;
  }

  global.bliIsGatewayUrl = bliIsGatewayUrl;
  global.bliMailConfig = bliMailConfig;
  global.bliMail = bliMail;
  global.bliCleanEmail = bliCleanEmail;
  global.bliAsciiHtml = bliAsciiHtml;
  global.bliSafeSubject = bliSafeSubject;
  global.bliGmailUrl = bliGmailUrl;
})(window);
