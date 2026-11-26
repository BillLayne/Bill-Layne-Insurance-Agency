(function(){
  'use strict';
  if (window.__bliMailMoved) return;   // old public address: moved.js passes the visitor on, nothing runs here
  var $ = function(id){ return document.getElementById(id); };
  var LS = {
    url:'bliMailGateway.url', secret:'bliMailGateway.secret',
    fromName:'bliMailGateway.fromName', bcc:'bliMailGateway.bcc',
    senderEmail:'bliMailGateway.senderEmail',
    draftSecret:'bliMailGateway.draftSecret',   // the draft-only key, kept here only to hand it to other tools
    agencySecret:'bliMailGateway.agencySecret'  // the website key, kept here only to hand it to Cloudflare
  };
  var keyScope = 'full';   // 'draft' once the gateway says this browser holds the draft-only key

  // The link fragment is read once, at start. A setup link (gw=) and a hand-off email (z=)
  // can arrive together when the old address passes a visitor on: #z=<email>&gw=<setup>.
  var START_HASH = location.hash || '';
  var GW_IN_HASH = (/[#&]gw=([A-Za-z0-9_-]+)/.exec(START_HASH) || [])[1] || '';
  var HANDOFF_HASH = START_HASH.replace(/[#&]gw=[A-Za-z0-9_-]+/, '');
  if (GW_IN_HASH) {   // the setup part leaves the address bar at once; a hand-off part stays until it is read
    try { history.replaceState(null, '', location.pathname + location.search + (HANDOFF_HASH.indexOf('#z=') === 0 ? HANDOFF_HASH : '')); } catch (e) {}
  }
  var SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
  var DEFAULT_AUTHUSER = 'bill@billlayneinsurance.com';
  var sourceLabel = '';

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function showResult(kind, htmlMsg){
    var r = $('result');
    r.className = kind === true ? 'ok' : (kind === 'warn' ? 'warn' : 'err');
    r.innerHTML = htmlMsg;
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearResult(){
    var r = $('result');
    r.className = '';
    r.style.display = '';
    r.innerHTML = '';
  }

  function fetchWithTimeout(url, opts, ms){
    var ctrl = new AbortController();
    var t = setTimeout(function(){ ctrl.abort(); }, ms);
    opts.signal = ctrl.signal;
    return fetch(url, opts).finally(function(){ clearTimeout(t); });
  }

  /* ---------- Where the secret is allowed to go ----------
     The secret is only ever posted to a Google Apps Script web app. A local
     address is accepted only while this page itself runs on this computer
     (testing against a mock). Everything that posts goes through isGatewayUrl(). */
  var GW_URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
  var ON_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function isGatewayUrl(u){
    u = String(u || '').trim();
    if (GW_URL_RE.test(u)) return true;
    return ON_LOCAL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);
  }
  var BAD_URL_MSG = '&#10060; The Gateway URL must be the Google Apps Script web app link (<code>https://script.google.com/&hellip;/exec</code>). Nothing was sent anywhere.';
  function gwTail(u){ var m = /\/s\/([A-Za-z0-9_-]+)\/exec$/.exec(u || ''); return m ? 'script.google.com &hellip;' + esc(m[1].slice(-6)) : 'a local test address'; }

  /* ---------- Setup links (#gw=): ask first, save nothing until the answer ----------
     A setup link used to be saved the moment the page opened. A link carrying only
     a different address then kept the saved secret and the page's own connection
     check posted that secret to the new address. Now a link must carry BOTH values,
     the address must be a Google script, and nothing is saved, checked or sent until
     someone clicks Yes. */
  var pendingGw = null;
  function showSetup(kind, html){
    var c = $('setupAsk');
    c.className = 'ask-card show' + (kind === 'ok' ? ' ok' : kind === 'err' ? ' err' : '');
    c.innerHTML = html;
    c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function readGwHash(){
    var raw = GW_IN_HASH;
    if (!raw) return;
    GW_IN_HASH = '';
    var d = null;
    try {
      var b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      d = JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) { d = null; }
    var u = (d && typeof d.u === 'string') ? d.u.trim() : '';
    var sec = (d && typeof d.s === 'string') ? d.s.trim() : '';
    if (!u || !sec || !isGatewayUrl(u)) {
      showSetup('err', '&#10060; <b>A setup link was opened, but it is not a valid BLI Mail Gateway link, so it was ignored.</b> Your saved settings were not changed and nothing was sent.');
      return;
    }
    var curUrl = localStorage.getItem(LS.url) || '', curSec = localStorage.getItem(LS.secret) || '';
    if (u === curUrl && sec === curSec) {
      showSetup('ok', '&#9989; This browser is already connected to that gateway. Nothing changed.');
      return;
    }
    pendingGw = { u: u, s: sec };
    var replacing = curUrl && curUrl !== u;
    showSetup('ask',
      '<b>&#9888;&#65039; A setup link wants to connect this browser to a Mail Gateway.</b><br>' +
      'Only say yes if <b>you made this link yourself</b> a moment ago (Settings &rarr; Copy setup link). ' +
      'A link from an email, a text or a web page should be ignored.' +
      '<ul><li>Gateway in the link: ' + gwTail(u) + '</li>' +
      (replacing ? '<li><b>It would REPLACE the gateway saved here now</b> (' + gwTail(curUrl) + ').</li>'
                 : (curUrl ? '<li>Same gateway address as now, with a different secret.</li>' : '<li>No gateway is saved in this browser yet.</li>')) +
      '</ul><div class="ask-btns">' +
      '<button type="button" class="btn-primary btn-mini" id="setupYes">Yes, connect this browser</button>' +
      '<button type="button" class="btn-quiet btn-mini" id="setupNo">No, ignore the link</button></div>');
    $('setupYes').addEventListener('click', function(){
      if (!pendingGw) return;
      localStorage.setItem(LS.url, pendingGw.u);
      localStorage.setItem(LS.secret, pendingGw.s);
      pendingGw = null;
      $('gwUrl').value = localStorage.getItem(LS.url);
      $('gwSecret').value = localStorage.getItem(LS.secret);
      $('setStatus').textContent = '\u2014 saved \u2713';
      showSetup('ok', '&#9989; Connected. Checking the gateway&hellip;');
      pingGateway(false);
    });
    $('setupNo').addEventListener('click', function(){
      pendingGw = null;
      showSetup('ok', 'Link ignored. Your saved settings were not changed.');
    });
  }

  $('copySetupLink').addEventListener('click', function(){
    var url = $('gwUrl').value.trim(), sec = $('gwSecret').value.trim();
    if (!url || !sec) {
      showResult(false, 'Enter and save both the Gateway URL and Secret first before copying a setup link.');
      return;
    }
    if (!isGatewayUrl(url)) { showResult(false, BAD_URL_MSG); return; }
    var json = JSON.stringify({ u: url, s: sec });
    var b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    var full = location.origin + location.pathname + '#gw=' + b64;
    navigator.clipboard.writeText(full).then(function(){
      showResult(true, '&#128279; Setup link copied. Open it in the other browser or tool and answer Yes there. <b>Treat it like a password</b>: it holds the gateway secret.');
    }, function(){
      showResult('warn', 'Clipboard blocked by browser — copy manually: <code>#gw=' + esc(b64) + '</code>');
    });
  });

  /* ---------- Settings & Secret-Verified Connection Ping ---------- */
  function loadSettings(){
    $('gwUrl').value = localStorage.getItem(LS.url) || '';
    $('gwSecret').value = localStorage.getItem(LS.secret) || '';
    var fn = localStorage.getItem(LS.fromName); if (fn !== null) $('fromNameInput').value = fn;
    var bc = localStorage.getItem(LS.bcc); if (bc !== null) $('bccInput').value = bc;
    updateDefaultsSummary();

    if (!$('gwUrl').value || !$('gwSecret').value) {
      $('settingsCard').open = true;
      $('connBadge').className = 'badge err';
      $('connBadge').textContent = 'Gateway: setup needed';
    } else {
      $('settingsCard').open = false;
      $('setStatus').textContent = '— saved ✓';
      pingGateway(true);
    }
    readGwHash();
  }

  $('toggleSettingsBtn').addEventListener('click', function(){
    var c = $('settingsCard');
    c.open = !c.open;
    if (c.open) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  function pingGateway(silent){
    var url = $('gwUrl').value.trim();
    var sec = $('gwSecret').value.trim();
    var badge = $('connBadge');
    if (!url) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: enter URL';
      return;
    }
    if (!isGatewayUrl(url)) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: check the URL';
      $('settingsCard').open = true;
      if (!silent) showResult(false, BAD_URL_MSG);
      return;
    }
    badge.className = 'badge';
    badge.textContent = 'Gateway: checking…';

    // POST mode:'ping' verifies BOTH the URL and GATEWAY_SECRET (v1.3 returns ok:true + quota;
    // v1.2 returns "mode must be 'draft' or 'send'" ONLY after passing the secret check!).
    var postBody = JSON.stringify({ secret: sec, mode: 'ping' });
    fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: postBody,
      redirect: 'follow'
    }, 25000)
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d && d.ok) {
          if (d.senderEmail) localStorage.setItem(LS.senderEmail, d.senderEmail);
          var q = (typeof d.remainingQuota === 'number') ? ' · ' + d.remainingQuota + ' left today' : '';
          keyScope = d.scope === 'draft' ? 'draft' : 'full';
          badge.className = 'badge ok';
          badge.textContent = 'Gateway: connected ✓ ' + (keyScope === 'draft' ? 'draft-only key ' : '') + '(v' + (d.version || '1.3') + q + ')';
          if (!silent) showResult(true, '&#9989; Connected &amp; secret verified' + (d.senderEmail ? ' as <b>' + esc(d.senderEmail) + '</b>' : '') + q + '.' +
            (keyScope === 'draft' ? ' This is the <b>draft-only key</b>: this browser can create drafts but cannot send.' : ''));
        } else if (d && /Unauthorized/i.test(d.error || '')) {
          badge.className = 'badge err';
          badge.textContent = 'Gateway: wrong secret';
          $('settingsCard').open = true;
          if (!silent) showResult(false, '&#10060; Reachable URL, but <b>GATEWAY_SECRET</b> did not match. Check Gateway settings above.');
        } else if (d && /mode must be/i.test(d.error || '')) {
          // Live gateway is v1.2 — secret passed! Fetch version via GET for display.
          badge.className = 'badge ok';
          badge.textContent = 'Gateway: connected & verified ✓ (v1.2)';
          if (!silent) showResult(true, '&#9989; Connected &amp; secret verified (running v1.2).');
        } else {
          badge.className = 'badge err';
          badge.textContent = 'Gateway: check settings';
          if (!silent) showResult(false, '&#10060; Unexpected gateway response: ' + esc((d && d.error) || 'unknown'));
        }
      })
      .catch(function(){
        badge.className = 'badge err';
        badge.textContent = 'Gateway: unreachable';
        if (!silent) showResult(false, '&#10060; Could not reach Gateway URL. Confirm it ends in <code>/exec</code> and is deployed with access "Anyone".');
      });
  }

  $('saveSettings').addEventListener('click', function(){
    var url = $('gwUrl').value.trim(), sec = $('gwSecret').value.trim();
    if (url && !isGatewayUrl(url)) {
      // Not saved: the secret must never be pointed at anything but the Google script.
      showResult(false, BAD_URL_MSG + ' Copy the Web app URL from Deploy &rarr; Manage deployments. Your settings were not changed.');
      return;
    }
    localStorage.setItem(LS.url, url);
    localStorage.setItem(LS.secret, sec);
    $('setStatus').textContent = (url && sec) ? '— saved ✓' : '';
    if (url && sec) {
      $('settingsCard').open = false;
      pingGateway(false);
    } else {
      showResult('warn', 'Enter both the Gateway URL and Secret, then click Save &amp; Test.');
    }
  });

  $('showSecret').addEventListener('click', function(){
    var hidden = $('gwSecret').classList.toggle('masked');   // a text box drawn as dots, never type=password
    this.textContent = hidden ? 'Show' : 'Hide';
  });

  $('testConn').addEventListener('click', function(){ pingGateway(false); });

  function updateDefaultsSummary(){
    var cc = $('ccInput').value.trim();
    var bcc = $('bccInput').value.trim();
    var fn = $('fromNameInput').value.trim() || 'Bill Layne Insurance';
    var parts = [];
    parts.push(bcc ? ('&#128274; BCC: ' + esc(bcc)) : '&#9888;&#65039; No BCC');
    if (cc) parts.push('CC: ' + esc(cc));
    parts.push('From: ' + esc(fn));
    $('defaultsSummary').innerHTML = parts.join(' &middot; ');
  }
  ['ccInput','bccInput','fromNameInput','replyToInput'].forEach(function(id){
    $(id).addEventListener('input', updateDefaultsSummary);
  });
  $('fromNameInput').addEventListener('change', function(){ localStorage.setItem(LS.fromName, this.value); });
  $('bccInput').addEventListener('change', function(){ localStorage.setItem(LS.bcc, this.value); });

  /* ---------- Three keys: make, test, hand out ----------
     GATEWAY_SECRET is the FULL key (draft + send) and belongs only on this page.
     GATEWAY_DRAFT_SECRET is the DRAFT-ONLY key for PDF Studio and every other tool.
     GATEWAY_AGENCY_SECRET is the WEBSITE key for the site's own forms: agency recipients only.
     New keys are made here, in the browser. They go nowhere except the clipboard and,
     when Test is pressed, to the Google script inside a ping. */
  var PDF_STUDIO_URL = 'https://www.billlayneinsurance.com/pdf-tools/';
  var PENDING = 'bliMailGateway.pendingKeys';   // sessionStorage: survives a reload, gone when the tab closes
  var pendingMem = null;
  function newKey(){
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', out = '', buf = new Uint8Array(64), i;
    while (out.length < 40) {
      crypto.getRandomValues(buf);
      for (i = 0; i < buf.length && out.length < 40; i++) if (buf[i] < 248) out += A.charAt(buf[i] % 62);   // 248 = 4 x 62, so no letter is favoured
    }
    return out;
  }
  function pendingKeys(){
    if (pendingMem) return pendingMem;
    try { var p = JSON.parse(sessionStorage.getItem(PENDING) || 'null'); if (p && p.f && p.d && p.a) pendingMem = p; } catch (e) {}
    return pendingMem;
  }
  function setPending(p){
    pendingMem = p;
    try { if (p) sessionStorage.setItem(PENDING, JSON.stringify(p)); else sessionStorage.removeItem(PENDING); } catch (e) {}
    $('keysShown').hidden = !p;
    $('newFullKey').value = p ? p.f : '';
    $('newDraftKey').value = p ? p.d : '';
    $('newAgencyKey').value = p ? p.a : '';
    $('keysTest').disabled = !p;
  }
  function keysMsg(kind, html){
    var r = $('keysResult');
    r.className = 'ask-card show' + (kind === 'ok' ? ' ok' : kind === 'err' ? ' err' : '');
    r.innerHTML = html;
  }
  function refreshDraftTools(){
    var has = !!localStorage.getItem(LS.draftSecret);
    $('keysPdfStudio').disabled = !has;
    $('keysCopyDraft').disabled = !has;
    $('keysCopyAgency').disabled = !localStorage.getItem(LS.agencySecret);
  }
  function pingWith(url, secret){
    return fetchWithTimeout(url, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: secret, mode: 'ping' }), redirect: 'follow'
    }, 25000).then(function(r){ return r.json(); }).catch(function(){ return { ok: false, unreachable: true }; });
  }
  function copyKey(text, okMsg){
    navigator.clipboard.writeText(text).then(function(){ keysMsg('ok', okMsg); },
      function(){ keysMsg('err', 'The browser blocked the clipboard. Allow it for this page and click Copy again.'); });
  }
  $('keysMake').addEventListener('click', function(){
    var url = (localStorage.getItem(LS.url) || '').trim();
    if (!url || !isGatewayUrl(url)) {
      keysMsg('err', 'Connect this browser to the gateway first: Gateway URL and current key above, then Save &amp; Test.');
      return;
    }
    if (pendingKeys() && this.getAttribute('data-sure') !== '1') {   // keys are already waiting: never replace them by accident
      this.setAttribute('data-sure', '1');
      this.textContent = 'Click again to throw those away and make new ones';
      return;
    }
    this.removeAttribute('data-sure');
    this.textContent = 'Make three new keys';
    setPending({ f: newKey(), d: newKey(), a: newKey() });
    keysMsg('ask', 'Three new keys are ready. <b>Nothing has changed yet.</b> Copy each one into Script properties (step 2), then press the Test button (step 3). Keep this tab open until then.');
  });
  $('copyAgencyKey').addEventListener('click', function(){ var p = pendingKeys(); if (p) copyKey(p.a, 'Website key copied. Paste it into <code>GATEWAY_AGENCY_SECRET</code>.'); });
  $('copyFullKey').addEventListener('click', function(){ var p = pendingKeys(); if (p) copyKey(p.f, 'Full key copied. Paste it into <code>GATEWAY_SECRET</code>.'); });
  $('copyDraftKey').addEventListener('click', function(){ var p = pendingKeys(); if (p) copyKey(p.d, 'Draft-only key copied. Paste it into <code>GATEWAY_DRAFT_SECRET</code>.'); });
  $('keysTest').addEventListener('click', function(){
    var p = pendingKeys(), url = (localStorage.getItem(LS.url) || '').trim(), btn = this;
    if (!p) return;
    if (!isGatewayUrl(url)) { keysMsg('err', BAD_URL_MSG); return; }
    btn.disabled = true;
    keysMsg('ask', 'Testing the keys&hellip;');
    Promise.all([pingWith(url, p.f), pingWith(url, p.d), pingWith(url, p.a)]).then(function(res){
      var full = res[0] || {}, draft = res[1] || {}, agency = res[2] || {};
      btn.disabled = false;
      if (full.unreachable || draft.unreachable || agency.unreachable) {
        keysMsg('err', '&#10060; Could not reach the gateway. Check the internet connection and test again. Nothing changed in this browser.');
        return;
      }
      if (full.ok && full.scope && full.scope !== 'full') {
        keysMsg('err', '&#10060; The keys are in the wrong boxes in Script properties: the <b>full key</b> was saved as the ' + (full.scope === 'draft' ? 'draft-only' : 'website') +
          ' key. The full key belongs in <code>GATEWAY_SECRET</code>, the draft-only key in <code>GATEWAY_DRAFT_SECRET</code>, the website key in <code>GATEWAY_AGENCY_SECRET</code>. Fix, save, and test again. Nothing changed in this browser.');
        return;
      }
      if (!full.ok) {
        keysMsg('err', '&#10060; The new full key is not in place yet. Check <code>GATEWAY_SECRET</code> in Script properties (no spaces before or after), save, and test again. Nothing changed in this browser.');
        return;
      }
      // The new full key is live, so the old one is dead: this browser switches to it now.
      localStorage.setItem(LS.secret, p.f);
      $('gwSecret').value = p.f;
      $('setStatus').textContent = '\u2014 saved \u2713';
      pingGateway(true);
      var draftOk = draft.ok && draft.scope === 'draft', agencyOk = agency.ok && agency.scope === 'agency';
      if (draftOk) localStorage.setItem(LS.draftSecret, p.d);
      if (agencyOk) localStorage.setItem(LS.agencySecret, p.a);
      refreshDraftTools();
      if (draftOk && agencyOk) {
        setPending(null);
        keysMsg('ok', '&#9989; <b>All three keys work.</b> This browser now uses the new full key, and the old key no longer works anywhere. Last step: hand out the other two keys (step 4).');
        return;
      }
      var missing = [];
      if (!draftOk) missing.push('<code>GATEWAY_DRAFT_SECRET</code> (draft-only key)');
      if (!agencyOk) missing.push('<code>GATEWAY_AGENCY_SECRET</code> (website key)');
      keysMsg('ask', '&#9989; The new full key works and is saved in this browser. &#9888;&#65039; <b>Not working yet: ' + missing.join(' and ') + '.</b> ' +
        (full.scope ? 'Check the name is spelled exactly and the value has no spaces, save, and test again.'
                    : 'The gateway script is still an older version that knows only one key. It needs the v1.4 update first.'));
    });
  });
  function draftSetupLink(){
    var json = JSON.stringify({ u: (localStorage.getItem(LS.url) || '').trim(), s: localStorage.getItem(LS.draftSecret) || '' });
    return PDF_STUDIO_URL + '#gw=' + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  $('keysPdfStudio').addEventListener('click', function(){
    if (!localStorage.getItem(LS.draftSecret)) return;
    window.open(draftSetupLink(), '_blank', 'noopener');
    keysMsg('ok', 'PDF Studio opened in a new tab. Click <b>Connect</b> there. If no tab opened, allow pop-ups for this page and click again.');
  });
  $('keysCopyDraft').addEventListener('click', function(){
    var d = localStorage.getItem(LS.draftSecret);
    if (d) copyKey(d, 'Draft-only key copied. Paste it into the other tool&rsquo;s gateway settings. It can create drafts but cannot send.');
  });
  $('keysCopyAgency').addEventListener('click', function(){
    var a = localStorage.getItem(LS.agencySecret);
    if (a) copyKey(a, 'Website key copied. Run <code>SET-WEBSITE-MAIL-KEY.cmd</code> and paste it when asked. It can only email the agency itself.');
  });
  // The website's After an Accident report emails the agency through the gateway with its own
  // saved key. This asks the website whether that still works. It sends nothing.
  var SITE_HEALTH_URL = 'https://www.billlayneinsurance.com/api/accident-report?health=1';
  $('keysCheckSite').addEventListener('click', function(){
    var btn = this;
    var WAIT = ' If you just ran it, the website needs about 3 minutes to update: check again then.';
    btn.disabled = true;
    keysMsg('ask', 'Checking the After an Accident page&hellip;');
    fetchWithTimeout(SITE_HEALTH_URL, { method: 'GET', cache: 'no-store' }, 25000)
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d && d.connected && d.ready && d.scope === 'agency') {
          keysMsg('ok', '&#9989; The After an Accident page is connected with the <b>website key</b>. Reports reach the agency inbox.');
        } else if (d && d.connected && d.ready) {
          keysMsg('ask', '&#9888;&#65039; The After an Accident page works, but it still holds a <b>full key</b>. Copy the website key and run <code>SET-WEBSITE-MAIL-KEY.cmd</code>.' + WAIT);
        } else {
          keysMsg('err', '&#10060; <b>The After an Accident page cannot send right now.</b> Its saved key is not accepted, so customers see the call-us message instead. Copy the website key and run <code>SET-WEBSITE-MAIL-KEY.cmd</code>.' + WAIT);
        }
      })
      .catch(function(){ keysMsg('err', 'Could not reach the website to check. Try again in a minute.'); })
      .then(function(){ btn.disabled = false; });
  });
  setPending(pendingKeys());
  refreshDraftTools();

  /* ---------- Email Cleaning, Subject Extraction & Pre-Flight QA ---------- */
  function extractTitle(html){
    var m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || '');
    if (!m) return '';
    var d = document.createElement('textarea');
    d.innerHTML = m[1].replace(/<[^>]+>/g, '');
    return d.value.replace(/\s+/g, ' ').trim();
  }

  function extractSubject(html){
    var m = /<!--\s*SUBJECT:\s*([\s\S]*?)\s*-->/i.exec(html || '');
    if (m && m[1].trim()) {
      var d = document.createElement('textarea');
      d.innerHTML = m[1];
      return d.value.replace(/\s+/g, ' ').trim();
    }
    return extractTitle(html);
  }

  // Pure-string cleaner (never DOMParser.outerHTML, which alters Outlook VML xmlns attributes).
  // Preserves <script type="application/ld+json"> Schema.org Gmail Rich Cards!
  function cleanEmailWithReport(html){
    if (!html) return { html: '', stripped: [] };
    var stripped = [];
    var out = String(html);

    if (/id=["']bli-send-toolbar["']/i.test(out)) stripped.push('Designer toolbar');
    if (/id=["']preview-toolbar["']/i.test(out)) stripped.push('Preview toolbar');

    out = out.replace(/^\s*<!--\s*SUBJECT:[\s\S]*?-->\s*/i, '');
    out = out.replace(/<!--[^>]*PREVIEW TOOLBAR[^>]*-->\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']bli-send-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']preview-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');

    var beforeScript = out;
    out = out.replace(/<script\b(?![^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
    if (out !== beforeScript && stripped.indexOf('Designer toolbar') === -1) stripped.push('script tag');

    var beforeSpacer = out;
    out = out.replace(/(<img\b[^>]*?\bsrc=["'])data:image\/png;base64,[A-Za-z0-9+\/=]+(["'][^>]*?\bwidth=["']600["'])/gi,
      function(_, a, b){ return a + SPACER_URL + b; });
    if (out !== beforeSpacer) stripped.push('600px CDN spacer');

    return { html: out, stripped: stripped };
  }

  function cleanEmail(html){
    return cleanEmailWithReport(html).html;
  }

  function asciiHtml(html){
    var out = '', i, cp;
    for (i = 0; i < html.length; i++) {
      cp = html.codePointAt(i);
      if (cp > 126) { out += '&#x' + cp.toString(16).toUpperCase() + ';'; if (cp > 0xFFFF) i++; }
      else out += html.charAt(i);
    }
    return out;
  }

  function safeSubject(s){
    return String(s || '').replace(/[\uD800-\uDFFF]/g, '').replace(/\s+/g, ' ').trim();
  }

  // Pre-Flight QA inspector (non-destructive visibility + guards against unfilled tokens / Cloudflare mangling)
  function inspectEmail(cleanedHtml, strippedList){
    var bytes = new Blob([cleanedHtml]).size;
    var kb = (bytes / 1024).toFixed(1);
    var errors = [];
    var warnings = [];

    var tokens = cleanedHtml.match(/\{\{[A-Za-z0-9_ -]{2,40}\}\}/g);
    if (tokens) {
      var uniq = Array.from(new Set(tokens)).slice(0, 3);
      errors.push('Unfilled token: ' + uniq.join(', '));
    }
    if (/__cf_email__|cdn-cgi\/l\/email-protection|data-cfemail/i.test(cleanedHtml)) {
      errors.push('Cloudflare email-obfuscation detected');
    }
    if (bytes > 102400) {
      warnings.push('Over 102 KB Gmail clip limit (' + kb + ' KB)');
    } else if (bytes > 98 * 1024) {
      warnings.push('Near 102 KB clip limit (' + kb + ' KB)');
    }
    if (/https?:\/\/i\.imgur\.com\//i.test(cleanedHtml)) {
      warnings.push('Legacy Imgur image URL (verify it loads)');
    }
    return { bytes: bytes, kb: kb, errors: errors, warnings: warnings, stripped: strippedList || [] };
  }

  function updateSubjectCoach(){
    var s = $('subjectInput').value.trim();
    var coach = $('subjCoach');
    var raw = $('htmlInput').value.trim();
    $('reExtractSubjBtn').hidden = !raw;
    if (!s) { coach.className = 'subj-coach'; coach.textContent = ''; return; }
    var len = s.length;
    var flags = [];
    if (len > 55) flags.push(len + ' chars (long)');
    if (/\$|\bfree\b|\burgent\b/i.test(s)) flags.push('spam-filter word/symbol');
    if (flags.length) {
      coach.className = 'subj-coach warn';
      coach.textContent = flags.join(' · ');
    } else {
      coach.className = 'subj-coach';
      coach.textContent = len + ' chars ✓';
    }
  }
  $('subjectInput').addEventListener('input', updateSubjectCoach);
  $('reExtractSubjBtn').addEventListener('click', function(){
    var t = extractSubject($('htmlInput').value);
    if (t) { $('subjectInput').value = safeSubject(t); updateSubjectCoach(); }
  });

  function setCodeCollapsed(collapsed){
    var wrap = $('codeWrap');
    var hasHtml = !!$('htmlInput').value.trim();
    wrap.hidden = collapsed && hasHtml;
    $('toggleCodeBtn').hidden = !hasHtml;
    $('toggleCodeBtn').textContent = wrap.hidden ? '</> View / Edit HTML' : 'Hide HTML Code';
    $('editCodeInlineBtn').textContent = wrap.hidden ? '</> View Code' : 'Hide Code';
  }

  $('toggleCodeBtn').addEventListener('click', function(){ setCodeCollapsed(!$('codeWrap').hidden); });
  $('editCodeInlineBtn').addEventListener('click', function(){ setCodeCollapsed(!$('codeWrap').hidden); });

  // Swap in a fresh iframe for every render. Setting srcdoc twice in quick succession on the
  // same iframe (empty-state placeholder at load, then a hand-off email a few ms later) makes
  // Chrome drop the second navigation, so the placeholder stayed on screen.
  function setPreview(html){
    var old = $('preview');
    var fresh = old.cloneNode(false);   // keeps id, sandbox, title and the viewport width
    fresh.srcdoc = html;
    old.parentNode.replaceChild(fresh, old);
  }

  function refresh(opts){
    opts = opts || {};
    var raw = $('htmlInput').value;
    var rep = cleanEmailWithReport(raw);
    var cleaned = rep.html;
    var qaBar = $('qaBar');

    if (!cleaned.trim()) {
      $('loadedBar').className = '';
      setCodeCollapsed(false);
      qaBar.innerHTML = '<span class="qa-pill">0.0 KB</span><span class="qa-pill">Paste or drop an email template to run BLI pre-flight checks</span>';
      setPreview('<body style="font-family:system-ui,-apple-system,sans-serif;color:#64748b;display:grid;place-items:center;height:100vh;margin:0;background:#f8fafc"><div style="text-align:center;padding:24px"><div style="font-size:32px;margin-bottom:8px">&#9993;&#65039;</div><div style="font-weight:700;color:#0f172a;margin-bottom:4px">Live Email Preview</div><div style="font-size:13px">Click <b>Paste HTML from Clipboard</b> or drop an <b>.html</b> file on the left</div></div></body>');
      updateSubjectCoach();
      return;
    }

    var qa = inspectEmail(cleaned, rep.stripped);
    var titleGuess = extractSubject(raw) || sourceLabel || 'Email template';

    $('loadedBar').className = 'show';
    $('loadedTitle').textContent = '✓ ' + (sourceLabel ? sourceLabel + ' · ' : '') + qa.kb + ' KB';
    if (opts.collapseCode) setCodeCollapsed(true);
    else $('toggleCodeBtn').hidden = false;

    if (opts.overwriteSubject || !$('subjectInput').value.trim()) {
      var extracted = extractSubject(raw);
      if (extracted) $('subjectInput').value = safeSubject(extracted);
    }
    updateSubjectCoach();

    // Render Pre-Flight QA Pills
    var pills = [];
    var sizeCls = qa.bytes > 102400 ? 'err' : (qa.bytes > 98 * 1024 ? 'warn' : 'ok');
    pills.push('<span class="qa-pill ' + sizeCls + '">' + (sizeCls === 'ok' ? '&#10003; ' : '&#9888; ') + qa.kb + ' KB</span>');

    if (qa.errors.length) {
      qa.errors.forEach(function(er){ pills.push('<span class="qa-pill err">&#10060; ' + esc(er) + '</span>'); });
    } else {
      pills.push('<span class="qa-pill ok">&#10003; Tokens &amp; links clean</span>');
    }
    qa.warnings.forEach(function(w){
      if (w.indexOf('clip limit') === -1) pills.push('<span class="qa-pill warn">&#9888; ' + esc(w) + '</span>');
    });
    if (qa.stripped.length) {
      pills.push('<span class="qa-pill ok">&#10003; Auto-cleaned: ' + esc(qa.stripped.join(', ')) + '</span>');
    }
    qaBar.innerHTML = pills.join('');

    setPreview(cleaned);
    return qa;
  }

  $('htmlInput').addEventListener('input', function(){
    sourceLabel = 'Edited HTML';
    refresh({ collapseCode: false });
  });
  // A whole email pasted straight into the code box (box empty, or everything selected)
  // is a new email too, not a small edit: run the same leftovers check.
  $('htmlInput').addEventListener('paste', function(e){
    var t = (e.clipboardData && e.clipboardData.getData('text')) || '';
    var all = !this.value.trim() || (this.selectionStart === 0 && this.selectionEnd === this.value.length);
    if (all && /<html[\s>]|<!doctype html|<table[\s>]/i.test(t)) newEmailLoaded();
  });

  /* ---------- Leftovers from the email before ----------
     The recipient and the attachments belong to ONE email. When a different email
     is loaded (clipboard, file, drop) whatever is still on the page belongs to the
     one before it. If that one was already drafted or sent, the leftovers are
     cleared (one click puts them back). If it was not, they are kept but nothing
     can be created or sent until someone says Keep or Clear. */
  var doneFor = null;      // set once a draft or send succeeded for the email on screen
  var carryOpen = false;   // true while a Keep / Clear answer is still owed
  var lastSent = null;     // signature of the last email that went out with Send Now
  function leftovers(){
    return { to: $('toInput').value.trim(), cc: $('ccInput').value.trim(), reply: $('replyToInput').value.trim(), files: attachments.slice() };
  }
  function leftoverList(l){
    var out = [];
    if (l.to) out.push('To: <b>' + esc(l.to) + '</b>');
    if (l.cc) out.push('CC: <b>' + esc(l.cc) + '</b>');
    if (l.files.length) out.push(l.files.length + ' attachment' + (l.files.length === 1 ? '' : 's') + ': <b>' + esc(l.files.map(function(a){ return a.name; }).join(', ')) + '</b>');
    return '<ul><li>' + out.join('</li><li>') + '</li></ul>';
  }
  function clearLeftovers(){
    $('toInput').value = ''; $('ccInput').value = ''; $('replyToInput').value = '';
    attachments = []; renderAttachments(); updateDefaultsSummary();
  }
  function hideCarry(){ carryOpen = false; var c = $('carryNote'); c.className = 'ask-card'; c.innerHTML = ''; }
  function newEmailLoaded(){
    var l = leftovers();
    var wasDone = !!doneFor;
    doneFor = null; lastSent = null;
    if (!l.to && !l.cc && !l.files.length) { hideCarry(); return; }
    var c = $('carryNote');
    if (wasDone) {
      clearLeftovers();
      carryOpen = false;
      c.className = 'ask-card show ok';
      c.innerHTML = '&#129529; <b>New email loaded.</b> The last email was already created, so its recipient and attachments were cleared:' + leftoverList(l) +
        '<div class="ask-btns"><button type="button" class="btn-quiet btn-mini" id="carryUndo">Put them back (same customer)</button></div>';
      $('carryUndo').addEventListener('click', function(){
        $('toInput').value = l.to; $('ccInput').value = l.cc; $('replyToInput').value = l.reply;
        attachments = l.files.slice(); renderAttachments(); updateDefaultsSummary(); hideCarry();
      });
    } else {
      carryOpen = true;
      c.className = 'ask-card show';
      c.innerHTML = '&#9888;&#65039; <b>Check before you continue.</b> These were on the page before this email was loaded. Do they belong to this customer?' + leftoverList(l) +
        '<div class="ask-btns"><button type="button" class="btn-primary btn-mini" id="carryKeep">Yes, keep them</button>' +
        '<button type="button" class="btn-quiet btn-mini" id="carryClear">No, clear them</button></div>';
      $('carryKeep').addEventListener('click', hideCarry);
      $('carryClear').addEventListener('click', function(){ clearLeftovers(); hideCarry(); });
    }
  }
  function emailSignature(to, subject, html){
    var h = 0, i; for (i = 0; i < html.length; i++) h = (h * 31 + html.charCodeAt(i)) | 0;
    return to.toLowerCase() + '|' + subject + '|' + html.length + '|' + h + '|' + attachments.map(function(a){ return a.name + ':' + a.size; }).join(',');
  }

  /* ---------- Paste from Clipboard / File Load / Clear ---------- */
  $('pasteClipBtn').addEventListener('click', function(){
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      setCodeCollapsed(false);
      $('htmlInput').focus();
      showResult('warn', 'Your browser requires manual paste — click inside the HTML box and press <b>Ctrl+V</b>.');
      return;
    }
    navigator.clipboard.readText().then(function(txt){
      if (!txt || !txt.trim()) {
        showResult('warn', 'Clipboard is empty — copy your finished HTML template first, then click Paste.');
        return;
      }
      newEmailLoaded();
      sourceLabel = 'Clipboard';
      $('htmlInput').value = txt;
      refresh({ collapseCode: true, overwriteSubject: true });
      clearResult();
    }).catch(function(){
      setCodeCollapsed(false);
      $('htmlInput').focus();
      showResult('warn', 'Clipboard permission was declined — press <b>Ctrl+V</b> inside the HTML box below.');
    });
  });

  $('pickFileBtn').addEventListener('click', function(){ $('fileInput').click(); });
  $('dropZone').addEventListener('click', function(e){
    if (e.target && e.target.tagName === 'LABEL') return;
    $('fileInput').click();
  });
  $('dropZone').addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fileInput').click(); }
  });

  function loadHtmlFile(file){
    if (!file) return;
    newEmailLoaded();   // before reading: PDFs dropped together with this email are added after this and stay
    var reader = new FileReader();
    reader.onload = function(){
      sourceLabel = file.name;
      $('htmlInput').value = String(reader.result || '');
      refresh({ collapseCode: true, overwriteSubject: true });
      clearResult();
    };
    reader.readAsText(file);
  }

  $('fileInput').addEventListener('change', function(){
    if (this.files && this.files[0]) loadHtmlFile(this.files[0]);
    this.value = '';
  });

  $('clearHtmlBtn').addEventListener('click', function(){
    disarmAll();
    doneFor = null; lastSent = null;
    sourceLabel = '';
    $('htmlInput').value = '';
    refresh({ collapseCode: false });
  });

  /* ---------- Attachments (up to 5 files, 18 MB total, individual remove) ---------- */
  var attachments = [];
  var MAX_ATTACH = 5, MAX_ATTACH_BYTES = 18 * 1024 * 1024;

  function totalAttachBytes(){
    return attachments.reduce(function(n, a){ return n + a.size; }, 0);
  }

  function fmtSize(bytes){
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(2) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function renderAttachments(){
    var ul = $('attachList');
    ul.innerHTML = attachments.map(function(a, idx){
      return '<li>' +
        '<span class="att-name" title="' + esc(a.name) + '">&#128196; ' + esc(a.name) + ' <span class="note">(' + fmtSize(a.size) + ')</span></span>' +
        '<button type="button" class="att-rm" data-idx="' + idx + '" aria-label="Remove ' + esc(a.name) + '">&times;</button>' +
      '</li>';
    }).join('');
    ul.querySelectorAll('.att-rm').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(this.getAttribute('data-idx'), 10);
        attachments.splice(idx, 1);
        disarmAll();
        renderAttachments();
      });
    });
    $('attachClear').hidden = !attachments.length;
    var tot = totalAttachBytes();
    $('attachMeter').textContent = attachments.length
      ? '(' + attachments.length + ' of ' + MAX_ATTACH + ' · ' + fmtSize(tot) + ' / 18 MB)'
      : '(optional · up to 5 files)';
  }

  function addAttachmentFiles(fileList){
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var total = totalAttachBytes();
    var skipped = [];
    var jobs = files.map(function(f){
      if (attachments.length + 1 > MAX_ATTACH || total + f.size > MAX_ATTACH_BYTES) {
        skipped.push(f.name);
        return null;
      }
      total += f.size;
      var slot = { name: f.name, mimeType: f.type || 'application/octet-stream', size: f.size, dataB64: '' };
      attachments.push(slot);
      return new Promise(function(resolve){
        var r = new FileReader();
        r.onload = function(){ slot.dataB64 = String(r.result || '').split(',')[1] || ''; resolve(); };
        r.onerror = function(){ attachments = attachments.filter(function(a){ return a !== slot; }); skipped.push(f.name); resolve(); };
        r.readAsDataURL(f);
      });
    }).filter(Boolean);
    Promise.all(jobs).then(function(){
      disarmAll();
      renderAttachments();
      if (skipped.length) showResult('warn', 'Skipped (limit is 5 files, 18 MB total): <b>' + esc(skipped.join(', ')) + '</b>');
    });
  }

  $('attachClear').addEventListener('click', function(){ attachments = []; disarmAll(); renderAttachments(); });
  $('attachInput').addEventListener('change', function(){ addAttachmentFiles(this.files); this.value = ''; });
  $('attachDrop').addEventListener('click', function(e){
    if (e.target && e.target.tagName === 'LABEL') return;
    $('attachInput').click();
  });
  $('attachDrop').addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('attachInput').click(); }
  });

  /* ---------- Smart Drag & Drop (Routes .html -> Email, PDFs/others -> Attachments) ---------- */
  function routeDroppedFiles(fileList){
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var htmlFiles = [], otherFiles = [];
    files.forEach(function(f){
      if (/\.html?$/i.test(f.name) || f.type === 'text/html') htmlFiles.push(f);
      else otherFiles.push(f);
    });
    if (htmlFiles[0]) loadHtmlFile(htmlFiles[0]);
    if (otherFiles.length) addAttachmentFiles(otherFiles);
  }

  var dz = $('dropZone'), adz = $('attachDrop'), toast = $('pageDropToast'), dragDepth = 0;
  [dz, adz].forEach(function(zone){
    ['dragenter','dragover'].forEach(function(ev){
      zone.addEventListener(ev, function(e){ e.preventDefault(); e.stopPropagation(); zone.classList.add('drag'); });
    });
    ['dragleave','drop'].forEach(function(ev){
      zone.addEventListener(ev, function(e){ e.preventDefault(); e.stopPropagation(); zone.classList.remove('drag'); });
    });
  });
  dz.addEventListener('drop', function(e){
    toast.classList.remove('show'); dragDepth = 0;
    routeDroppedFiles(e.dataTransfer && e.dataTransfer.files);
  });
  adz.addEventListener('drop', function(e){
    toast.classList.remove('show'); dragDepth = 0;
    addAttachmentFiles(e.dataTransfer && e.dataTransfer.files);
  });

  window.addEventListener('dragenter', function(e){
    if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') !== -1) {
      dragDepth++;
      toast.classList.add('show');
    }
  });
  window.addEventListener('dragover', function(e){ e.preventDefault(); });
  window.addEventListener('dragleave', function(){
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) toast.classList.remove('show');
  });
  window.addEventListener('drop', function(e){
    e.preventDefault();
    dragDepth = 0;
    toast.classList.remove('show');
    routeDroppedFiles(e.dataTransfer && e.dataTransfer.files);
  });

  /* ---------- Hand-Off Intake (#z= compressed email payload) ---------- */
  function b64urlToBytes(s){
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), u = new Uint8Array(bin.length), i;
    for (i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function inflateRaw(bytes){
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
  }
  function showHandoff(ok, htmlMsg){
    var h = $('handoff');
    h.className = 'show' + (ok ? '' : ' err');
    h.innerHTML = htmlMsg;
  }
  function takeHandoff(){
    var h = HANDOFF_HASH;
    if (h.indexOf('#z=') !== 0) return;
    var data = h.slice(3);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    Promise.resolve().then(function(){ return inflateRaw(b64urlToBytes(data)); }).then(function(json){
      var p = JSON.parse(json);
      if (!p || typeof p.html !== 'string' || !p.html) throw new Error('empty');
      sourceLabel = p.name || 'Handoff email';
      $('htmlInput').value = p.html;
      $('subjectInput').value = safeSubject(p.subject || '');
      $('toInput').value = String(p.to || '');
      $('ccInput').value = String(p.cc || '');
      updateDefaultsSummary();
      attachments = []; renderAttachments();
      doneFor = null; lastSent = null; hideCarry();
      refresh({ collapseCode: true, overwriteSubject: false });
      showHandoff(true, '&#9989; Loaded <b>' + esc(p.name || 'email') + '</b>. Verify recipient &amp; preview, add any PDF attachment, then click <b>Create Gmail Draft</b>.');
    }).catch(function(){
      showHandoff(false, '&#10060; That hand-off link could not be read. Drop or paste the email HTML below instead.');
    });
  }

  /* ---------- Preview Viewport & Backdrop Toggles ---------- */
  document.querySelectorAll('.vp-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.vp-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var w = btn.getAttribute('data-w');
      $('preview').style.width = (w === 'full') ? '100%' : (w + 'px');
    });
  });
  $('darkBackdropBtn').addEventListener('click', function(){
    $('previewShell').classList.toggle('dark-stage');
    this.classList.toggle('active');
  });

  /* ---------- Copy Cleaned HTML & Clear for Next Customer ---------- */
  $('copyCleanBtn').addEventListener('click', function(){
    var cleaned = cleanEmail($('htmlInput').value.trim());
    if (!cleaned) { showResult('warn', 'Load or paste an email template first.'); return; }
    navigator.clipboard.writeText(cleaned).then(function(){
      showResult(true, '&#128203; Cleaned email HTML copied to clipboard.');
    }, function(){
      showResult(false, 'Browser blocked clipboard access.');
    });
  });

  $('resetAllBtn').addEventListener('click', function(){
    disarmAll();
    doneFor = null; lastSent = null; hideCarry();
    sourceLabel = '';
    $('htmlInput').value = '';
    $('toInput').value = '';
    $('ccInput').value = '';
    $('subjectInput').value = '';
    $('replyToInput').value = '';
    $('handoff').className = '';
    attachments = [];
    renderAttachments();
    updateDefaultsSummary();
    refresh({ collapseCode: false });
    showResult(true, '&#129529; Cleared recipient, HTML, and attachments — ready for the next customer.');
  });

  /* ---------- Protect Unsaved Work on Sibling Navigation ---------- */
  function isDirty(){
    return !!($('htmlInput').value.trim() || attachments.length || $('toInput').value.trim());
  }
  document.querySelectorAll('.sibling-link').forEach(function(a){
    a.addEventListener('click', function(e){
      if (isDirty()) {
        e.preventDefault();
        window.open(this.href, '_blank', 'noopener');
      }
    });
  });

  /* ---------- Two-Click Arming & Submit ---------- */
  var sendArmed = false, qaOverrideFor = null, armTimer = null;   // qaOverrideFor: 'draft' | 'send' while "anyway" is armed
  var SEND_LABEL = $('sendBtn').innerHTML;
  var DRAFT_LABEL = $('draftBtn').innerHTML;

  function disarmAll(){
    sendArmed = false;
    qaOverrideFor = null;
    clearTimeout(armTimer);
    var sb = $('sendBtn'), db = $('draftBtn');
    sb.classList.remove('armed'); sb.innerHTML = SEND_LABEL;
    db.classList.remove('armed'); db.innerHTML = DRAFT_LABEL;
  }
  document.addEventListener('input', disarmAll, true);
  document.addEventListener('change', disarmAll, true);

  function gmailLinkFor(d){
    var user = encodeURIComponent((d && d.senderEmail) || localStorage.getItem(LS.senderEmail) || DEFAULT_AUTHUSER);
    var base = 'https://mail.google.com/mail/?authuser=' + user;
    if (d && d.mode === 'send') return base + '#sent';
    if (d && d.messageId) return base + '#drafts/' + encodeURIComponent(d.messageId);
    return base + '#drafts';
  }

  function submit(mode){
    var url = ($('gwUrl').value || '').trim();
    var secret = ($('gwSecret').value || '').trim();
    if (!url || !secret) {
      $('settingsCard').open = true;
      $('settingsCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showResult(false, '&#9888;&#65039; Enter the Gateway URL and Secret in <b>Gateway settings</b> above, then click <b>Save &amp; Test</b>.');
      return;
    }
    if (!isGatewayUrl(url)) {
      disarmAll();
      $('settingsCard').open = true;
      showResult(false, BAD_URL_MSG);
      return;
    }
    if (carryOpen) {
      disarmAll();
      $('carryNote').scrollIntoView({ behavior: 'smooth', block: 'center' });
      showResult(false, '&#10060; NOT ' + (mode === 'send' ? 'SENT' : 'CREATED') + ' &mdash; first answer the yellow box at the top of this column: keep or clear the recipient and attachments left from the email before.');
      return;
    }

    if (mode === 'send' && keyScope === 'draft') {
      disarmAll();
      showResult(false, '&#10060; NOT SENT &mdash; this browser holds the <b>draft-only key</b>, which cannot send. Use <b>Create Gmail Draft</b>, or save the full key in Gateway settings.');
      return;
    }

    var rep = cleanEmailWithReport($('htmlInput').value.trim());
    var html = rep.html;
    if (!html) {
      showResult(false, '&#9888;&#65039; Paste or drop the email HTML first (Step 1).');
      return;
    }

    var to = $('toInput').value.trim();
    if (mode === 'send' && !to) {
      disarmAll();
      $('toInput').focus();
      showResult(false, '&#10060; NOT SENT — "Send Now" requires a customer email in <b>To</b> (Step 2).');
      return;
    }

    // Pre-Flight safety guard: if unfilled {{TOKENS}} or Cloudflare corruption exist, warn before proceeding!
    var qa = inspectEmail(html, rep.stripped);
    if (qa.errors.length && qaOverrideFor !== mode && !sendArmed) {
      qaOverrideFor = mode;
      var targetBtn = mode === 'send' ? $('sendBtn') : $('draftBtn');
      targetBtn.classList.add('armed');
      targetBtn.textContent = '⚠️ Click again to ' + (mode === 'send' ? 'send anyway' : 'draft anyway');
      showResult('warn', '&#9888;&#65039; Pre-flight check flagged: <b>' + esc(qa.errors.join(' · ')) + '</b>. Fix the HTML, or click the orange button again within 10s to proceed anyway.');
      clearTimeout(armTimer);
      armTimer = setTimeout(disarmAll, 10000);
      return;
    }

    // Two-click confirmation on Send Now (no native window.confirm!)
    var subjectNow = safeSubject($('subjectInput').value);
    var sig = emailSignature(to, subjectNow, html);
    if (mode === 'send' && !sendArmed) {
      sendArmed = true;
      var sb = $('sendBtn');
      var nFiles = attachments.length;
      var again = lastSent && lastSent.sig === sig;
      sb.classList.add('armed');
      sb.textContent = (again ? '⚠️ Already sent. Click again to send a SECOND copy to ' : '⚠️ Click again to send to ') + to + (nFiles ? ' (+' + nFiles + ' file' + (nFiles === 1 ? '' : 's') + ')' : '');
      var fileNote = nFiles ? ' with <b>' + nFiles + ' attachment' + (nFiles === 1 ? '' : 's') + '</b> (' + esc(attachments.map(function(a){ return a.name; }).join(', ')) + ')' : '';
      showResult('warn', again
        ? '&#9888;&#65039; <b>This exact email ' + (lastSent.sure ? 'was already sent' : 'may already have gone out') + '</b> to <b>' + esc(to) + '</b>' + fileNote + '. Check Gmail Sent first. Click the orange button again within 10 seconds only if you want a second copy.'
        : 'Ready — click the orange button again within 10 seconds to send immediately to <b>' + esc(to) + '</b>' + fileNote + '.');
      clearTimeout(armTimer);
      armTimer = setTimeout(disarmAll, 10000);
      return;
    }
    disarmAll();

    var payload = {
      secret: secret,
      mode: mode,
      to: to,
      subject: subjectNow,
      html: asciiHtml(html),
      cc: $('ccInput').value.trim(),
      bcc: $('bccInput').value.trim(), // '' = explicit no BCC
      fromName: $('fromNameInput').value.trim(),
      replyTo: $('replyToInput').value.trim()
    };
    if (attachments.length) {
      payload.attachments = attachments.map(function(a){
        return { name: a.name, mimeType: a.mimeType, dataB64: a.dataB64 };
      });
    }

    var draftBtn = $('draftBtn'), sendBtn = $('sendBtn');
    draftBtn.disabled = sendBtn.disabled = true;
    showResult(true, mode === 'send' ? 'Sending email…' : 'Creating Gmail draft…');

    fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    }, 45000)
      .then(function(r){
        return r.json().catch(function(){
          throw new Error('Gateway returned a bad response (HTTP ' + r.status + '). Is the web app deployed with access "Anyone"?');
        });
      })
      .then(function(d){
        if (!d.ok) throw new Error(d.error || 'Gateway error.');
        doneFor = { mode: d.mode, to: to };            // the email on screen now exists in Gmail
        if (d.mode === 'send') lastSent = { sig: sig, sure: true };
        if (d.senderEmail) localStorage.setItem(LS.senderEmail, d.senderEmail);
        var quota = (typeof d.remainingQuota === 'number') ? ' &middot; ' + d.remainingQuota + ' sends left today' : '';
        if (typeof d.remainingQuota === 'number') {
          $('connBadge').className = 'badge ok';
          $('connBadge').textContent = 'Gateway: connected ✓ ' + (keyScope === 'draft' ? 'draft-only key ' : '') + '(' + d.remainingQuota + ' left today)';
        }
        var want = attachments.length;
        var att = want ? ((d.attached === want)
          ? ' with <b>' + want + ' attachment' + (want === 1 ? '' : 's') + '</b>'
          : ' &mdash; <b>&#9888;&#65039; attachments did NOT attach</b> (' + (d.attached || 0) + ' of ' + want + ')') : '';
        var link = gmailLinkFor(d);
        if (d.mode === 'send') {
          showResult(true, '&#9989; <b>SENT</b> to <b>' + esc(d.to) + '</b>' + att +
            ' &mdash; <a href="' + link + '" target="_blank" rel="noopener">Open Gmail Sent &rarr;</a>' + quota);
        } else {
          var label = d.messageId ? 'Open this Draft in Gmail &rarr;' : 'Open Gmail Drafts &rarr;';
          showResult(true, '&#9989; <b>Draft created</b>' + (d.to ? ' for <b>' + esc(d.to) + '</b>' : '') + att +
            ' &mdash; <a href="' + link + '" target="_blank" rel="noopener">' + label + '</a>' + quota);
        }
      })
      .catch(function(e){
        var timedOut = e && e.name === 'AbortError';
        if (timedOut && mode === 'send') lastSent = { sig: sig, sure: false };   // it may still have gone out
        var msg = timedOut
          ? (mode === 'send'
              ? 'The gateway took too long to answer (45s). The email MAY STILL HAVE BEEN SENT: check Gmail Sent before you try again.'
              : 'The gateway took too long to answer (45s). Check Gmail Drafts before you try again.')
          : (e && e.message) || 'Unknown error.';
        showResult(false, '&#10060; ' + esc(msg));
      })
      .finally(function(){
        draftBtn.disabled = sendBtn.disabled = false;
      });
  }

  // A click on Draft cancels a pending Send (and the other way round), but it must
  // not cancel its own "draft anyway" arm: that is what made the second click do nothing.
  $('draftBtn').addEventListener('click', function(){ if (sendArmed || qaOverrideFor !== 'draft') disarmAll(); submit('draft'); });
  $('sendBtn').addEventListener('click', function(){ if (qaOverrideFor === 'draft') disarmAll(); submit('send'); });

  loadSettings();
  refresh();
  takeHandoff();
  if (pendingKeys()) { $('settingsCard').open = true; $('keysBox').open = true; }   // came back mid key change: show where things stand
})();
