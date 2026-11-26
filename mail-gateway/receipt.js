(function () {
  'use strict';
  if (window.__bliMailMoved) return;   // old public address: moved.js passes the visitor on, nothing runs here
  var $ = function (id) { return document.getElementById(id); };
  var keyScope = 'full';   // 'draft' once the gateway says this browser holds the draft-only key
  var SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
  var DEFAULT_AUTHUSER = 'bill@billlayneinsurance.com';
  var LS = { url: 'bliMailGateway.url', secret: 'bliMailGateway.secret', senderEmail: 'bliMailGateway.senderEmail' };
  var subjectDirty = false;
  var armed = false, armTimer = null;

  var CARRIERS = [
    { name: 'Progressive', logo: 'https://img.billlayneinsurance.com/i/2026/11/progressive-logo-white-bg-jnt93f.png', legal: 'Progressive Universal Insurance Company' },
    { name: 'Nationwide', logo: 'https://img.billlayneinsurance.com/i/2026/11/nationwide-logo-white-bg-v8e8qq.png', legal: 'Nationwide Mutual Insurance Company' },
    { name: 'National General', logo: 'https://img.billlayneinsurance.com/i/2026/11/national-general-logo-white-bg-rq634g.png', legal: 'Integon National Insurance Company' },
    { name: 'Travelers', logo: 'https://img.billlayneinsurance.com/i/2026/11/travelers-logo-white-bg-97hekp.png', legal: 'The Travelers Indemnity Company' },
    { name: 'Foremost', logo: 'https://img.billlayneinsurance.com/i/2026/08/foremost-logo-eh5sta.jpg', legal: 'Foremost Insurance Company' },
    { name: 'Dairyland', legal: 'Dairyland Insurance Company' },
    { name: 'Hagerty', legal: 'Essentia Insurance Company' },
    { name: 'Alamance Farmers Mutual', logo: 'https://img.billlayneinsurance.com/i/2026/11/alamance-farmers-logo-white-bg-rr2rqh.png', legal: 'Alamance Farmers Mutual Insurance Company' },
    { name: 'NC Grange Mutual', legal: 'NC Grange Mutual Insurance Company' },
    { name: 'NCJUA', logo: 'https://img.billlayneinsurance.com/i/2026/11/ncjua-logo-white-bg-nn9d3d.png', legal: 'NC Joint Underwriting Association' },
    { name: 'Steadily', legal: 'Fortegra Specialty Insurance Company' }
  ];
  var sel = $('carrier');
  CARRIERS.forEach(function (c, i) {
    var o = document.createElement('option'); o.value = String(i); o.textContent = c.name; sel.appendChild(o);
  });
  var other = document.createElement('option'); other.value = 'other'; other.textContent = 'Other / not listed'; sel.appendChild(other);
  sel.addEventListener('change', function () {
    $('customCarrierWrap').style.display = sel.value === 'other' ? 'block' : 'none';
    autoSubject(); render();
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function showResult(kind, msg) {
    var r = $('result');
    r.className = kind === true ? 'ok' : (kind === 'warn' ? 'warn' : 'err');
    r.innerHTML = msg;
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function disarm() {
    armed = false;
    clearTimeout(armTimer);
    var b = $('sendBtn');
    b.classList.remove('armed');
    b.innerHTML = '&#9889; Send Now';
  }

  /* ---------- Settings & Ping (no native prompt!) ---------- */
  function loadSettings() {
    $('gwUrl').value = localStorage.getItem(LS.url) || '';
    $('gwSecret').value = localStorage.getItem(LS.secret) || '';
    if (!$('gwUrl').value || !$('gwSecret').value) {
      $('settingsCard').open = true;
      $('connBadge').className = 'badge err';
      $('connBadge').textContent = 'Gateway: setup needed';
    } else {
      $('settingsCard').open = false;
      $('setStatus').textContent = '— saved ✓';
      pingGateway(true);
    }
  }
  $('toggleSettingsBtn').addEventListener('click', function () {
    var c = $('settingsCard');
    c.open = !c.open;
    if (c.open) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('showSecretBtn').addEventListener('click', function () {
    var hidden = $('gwSecret').classList.toggle('masked');   // a text box drawn as dots, never type=password
    this.textContent = hidden ? 'Show Secret' : 'Hide Secret';
  });
  $('saveSettingsBtn').addEventListener('click', function () {
    var u = $('gwUrl').value.trim(), s = $('gwSecret').value.trim();
    if (u && !isGatewayUrl(u)) { showResult(false, BAD_URL_MSG + ' Your settings were not changed.'); return; }
    localStorage.setItem(LS.url, u);
    localStorage.setItem(LS.secret, s);
    $('setStatus').textContent = (u && s) ? '— saved ✓' : '';
    if (u && s) { $('settingsCard').open = false; pingGateway(false); }
    else showResult('warn', 'Enter both the Gateway URL and Secret above.');
  });

  // The secret is only ever posted to a Google Apps Script web app (a local address
  // only while this page itself runs on this computer, for tests against a mock).
  var GW_URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
  var ON_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function isGatewayUrl(u) { u = String(u || '').trim(); return GW_URL_RE.test(u) || (ON_LOCAL && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u)); }
  var BAD_URL_MSG = '&#10060; The Gateway URL must be the Google Apps Script web app link (<code>https://script.google.com/&hellip;/exec</code>). Nothing was sent anywhere.';

  function pingGateway(silent) {
    var u = $('gwUrl').value.trim(), s = $('gwSecret').value.trim();
    var badge = $('connBadge');
    if (!u) { badge.className = 'badge err'; badge.textContent = 'Gateway: setup needed'; return; }
    if (!isGatewayUrl(u)) {
      badge.className = 'badge err'; badge.textContent = 'Gateway: check the URL';
      $('settingsCard').open = true;
      if (!silent) showResult(false, BAD_URL_MSG);
      return;
    }
    badge.className = 'badge'; badge.textContent = 'Gateway: checking…';
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 20000);
    fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: s, mode: 'ping' }),
      redirect: 'follow', signal: ctrl.signal
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          if (d.senderEmail) localStorage.setItem(LS.senderEmail, d.senderEmail);
          var q = typeof d.remainingQuota === 'number' ? ' · ' + d.remainingQuota + ' left' : '';
          keyScope = d.scope === 'draft' ? 'draft' : 'full';
          badge.className = 'badge ok'; badge.textContent = 'Gateway: connected ✓ ' + (keyScope === 'draft' ? 'draft-only key ' : '') + '(v' + (d.version || '1.3') + q + ')';
          if (!silent) showResult(true, '&#9989; Gateway connected &amp; secret verified.' + (keyScope === 'draft' ? ' This is the <b>draft-only key</b>: this browser can create drafts but cannot send.' : ''));
        } else if (d && /mode must be/i.test(d.error || '')) {
          badge.className = 'badge ok'; badge.textContent = 'Gateway: connected ✓ (v1.2)';
          if (!silent) showResult(true, '&#9989; Gateway connected &amp; secret verified.');
        } else {
          badge.className = 'badge err'; badge.textContent = 'Gateway: check secret';
          $('settingsCard').open = true;
          if (!silent) showResult(false, '&#10060; ' + esc((d && d.error) || 'Check gateway URL/secret'));
        }
      })
      .catch(function () { badge.className = 'badge err'; badge.textContent = 'Gateway: unreachable'; })
      .then(function () { clearTimeout(t); });
  }

  function carrierNames() {
    if (sel.value === 'other') {
      return { name: $('carrierName').value.trim() || '—', legal: $('carrierLegal').value.trim() || $('carrierName').value.trim() || '—' };
    }
    var c = CARRIERS[parseInt(sel.value, 10)] || CARRIERS[0];
    return { name: c.name, legal: c.legal, logo: c.logo || '' };
  }

  function fmtAmount(v) {
    var n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return { fmt: '—', raw: '—' };
    var raw = n.toFixed(2);
    var fmt = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return { fmt: fmt, raw: raw };
  }
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function humanDate(iso) {
    if (!iso) return { human: '—', iso: '—' };
    var p = iso.split('-');
    if (p.length !== 3) return { human: '—', iso: '—' };
    return { human: MONTHS[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10) + ', ' + p[0], iso: iso };
  }
  function methodShort(full) {
    if (!full) return '—';
    var last4 = (full.match(/(\d{4})(?!.*\d)/) || [])[1] || '';
    var brand = (full.match(/visa|mastercard|amex|american express|discover|debit|credit|checking|savings|ach|e-?check|card/i) || [''])[0];
    var map = { 'american express': 'Amex', 'mastercard': 'MC', 'checking': 'ACH', 'savings': 'ACH', 'e-check': 'ACH', 'echeck': 'ACH' };
    brand = brand ? (map[brand.toLowerCase()] || (brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase())) : 'Card';
    var s = last4 ? brand + ' ••' + last4 : brand;
    return s.length > 12 ? s.slice(0, 12) : s;
  }
  function dash(v) { var t = String(v || '').trim(); return t ? esc(t) : '—'; }

  function values() {
    var c = carrierNames();
    var a = fmtAmount($('amount').value);
    var d = humanDate($('pdate').value);
    var cs = humanDate($('cstart').value);
    var ce = humanDate($('cend').value);
    var policy = $('policy').value.trim();
    var conf = $('conf').value.trim();
    var txn = $('txn').value.trim();
    var first = $('first').value.trim(), last = $('last').value.trim();
    // Optional parts of the Gmail White template that are left out when their field is blank.
    var drop = [];
    if (!$('ptime').value.trim()) drop.push('PAYMENT_TIME');
    if (!$('method').value.trim()) drop.push('PAYMENT_METHOD');
    if (!conf) drop.push('CONFIRMATION_NUMBER');
    if (!conf && !txn) drop.push('TRANSACTION_ID');
    if (!policy) drop.push('POLICY_NUMBER');
    if (cs.human === '—' || ce.human === '—') drop.push('COVERAGE_PERIOD');
    return {
      _drop: drop, CARRIER_LOGO_URL: c.logo || '',
      PAYER_NAME: dash((first + ' ' + last).trim()),
      FIRST_NAME: dash($('first').value), LAST_NAME: dash($('last').value),
      PAYMENT_AMOUNT: a.fmt, PAYMENT_AMOUNT_RAW: a.raw,
      PAYMENT_DATE: d.human, PAYMENT_DATE_ISO: d.iso,
      PAYMENT_TIME: dash($('ptime').value),
      PAYMENT_METHOD: dash($('method').value),
      PAYMENT_METHOD_SHORT: esc(methodShort($('method').value.trim())),
      CONFIRMATION_NUMBER: dash(conf),
      TRANSACTION_ID: txn ? esc(txn) : dash(conf),
      POLICY_NUMBER: dash(policy),
      POLICY_NUMBER_LAST4: policy ? esc(policy.slice(-4)) : '—',
      POLICY_TYPE: esc($('ptype').value),
      CARRIER_NAME: esc(c.name), CARRIER_LEGAL: esc(c.legal),
      COVERAGE_START: cs.human, COVERAGE_END: ce.human
    };
  }

  function upgradeSpacer(html) {
    return String(html || '').replace(/(<img\b[^>]*?\bsrc=["'])data:image\/png;base64,[A-Za-z0-9+\/=]+(["'][^>]*?\bwidth=["']600["'])/gi,
      function (_, a, b) { return a + SPACER_URL + b; });
  }
  function asciiHtml(html) {
    var out = '', i, cp;
    for (i = 0; i < html.length; i++) {
      cp = html.codePointAt(i);
      if (cp > 126) { out += '&#x' + cp.toString(16).toUpperCase() + ';'; if (cp > 0xFFFF) i++; }
      else out += html.charAt(i);
    }
    return out;
  }
  function safeSubject(s) {
    return String(s || '').replace(/[\uD800-\uDFFF]/g, '').replace(/\s+/g, ' ').trim();
  }
  function gmailLinkFor(d) {
    var user = encodeURIComponent((d && d.senderEmail) || localStorage.getItem(LS.senderEmail) || DEFAULT_AUTHUSER);
    var base = 'https://mail.google.com/mail/?authuser=' + user;
    if (d && d.mode === 'send') return base + '#sent';
    if (d && d.messageId) return base + '#drafts/' + encodeURIComponent(d.messageId);
    return base + '#drafts';
  }

  function fill() {
    var v = values();
    var html = window.BLI_RECEIPT_TEMPLATE;
    // Template markers are HTML comments; the opener is built from two pieces so this inline script never holds one.
    var CO = '<' + '!--';
    v._drop.forEach(function (name) {
      html = html.split(CO + 'OPTIONAL: ' + name + '-->').map(function (part, i) {
        if (i === 0) return part;
        var end = part.indexOf(CO + 'END OPTIONAL-->');
        return end === -1 ? part : part.slice(end + (CO + 'END OPTIONAL-->').length);
      }).join('');
    });
    if (!v.CARRIER_LOGO_URL) {
      html = html.split(CO + 'IF:CARRIER_LOGO-->').map(function (part, i) {
        if (i === 0) return part;
        var end = part.indexOf(CO + 'ENDIF:CARRIER_LOGO-->');
        return end === -1 ? part : part.slice(end + (CO + 'ENDIF:CARRIER_LOGO-->').length);
      }).join('');
    }
    html = html.replace(new RegExp(CO + '(?:OPTIONAL: [A-Z_]+|END OPTIONAL|IF:CARRIER_LOGO|ENDIF:CARRIER_LOGO)-->\n?', 'g'), '');
    Object.keys(v).forEach(function (k) {
      if (k.charAt(0) === '_') return;
      html = html.split('{{' + k + '}}').join(String(v[k]));
    });
    return upgradeSpacer(html);
  }

  function integrity(html) {
    var problems = [];
    var m = html.match(/\{\{[A-Z_]+\}\}/);
    if (m) problems.push('unfilled variable ' + m[0]);
    ['cdn-cgi', '__cf_email__', 'email-protection', 'XacnUW4', 'border-radius:50%'].forEach(function (bad) {
      if (html.indexOf(bad) !== -1) problems.push('forbidden string: ' + bad);
    });
    if (html.indexOf('mailto:Save@BillLayneInsurance.com') === -1 && html.indexOf('mailto:Save&#64;BillLayneInsurance&#46;com') === -1) problems.push('Save@ mailto missing');
    if (new Blob([html]).size > 102400) problems.push('over Gmail 102 KB clip limit');
    return problems;
  }

  function missingRequired() {
    var m = [];
    if (!$('first').value.trim()) m.push('First name');
    if (fmtAmount($('amount').value).fmt === '—') m.push('Amount paid');
    return m;
  }

  function autoSubject() {
    if (subjectDirty) return;
    var c = carrierNames();
    var s = ('your payment receipt — ' + (c.name === '—' ? 'Bill Layne Insurance' : c.name)).toLowerCase();
    if (s.length > 45) s = s.slice(0, 45);
    $('subject').value = s;
  }
  $('subject').addEventListener('input', function () { subjectDirty = true; });

  function render() {
    var html = fill();
    $('preview').srcdoc = html;
    var probs = integrity(html);
    var missing = missingRequired();
    var parts = [];
    if (missing.length) parts.push('<span class="bad">missing: ' + missing.map(esc).join(', ') + '</span>');
    if (probs.length) parts.push('<span class="bad">' + probs.map(esc).join(' · ') + '</span>');
    $('checks').innerHTML = parts.length
      ? 'Checks: ' + parts.join(' · ')
      : 'Checks: all clear ✓ (' + (new Blob([html]).size / 1024).toFixed(1) + ' KB)';
    // Keep buttons enabled so clicks always give loud, actionable feedback!
    return { html: html, problems: probs, missing: missing };
  }

  /* ---------- Preview Viewport Switcher ---------- */
  document.querySelectorAll('.vp-btns button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.vp-btns button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var w = btn.getAttribute('data-w');
      $('preview').style.width = w === 'full' ? '100%' : (w + 'px');
    });
  });

  /* ---------- Protect Unsaved Work on Sibling Links ---------- */
  document.querySelectorAll('.sibling-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if ($('first').value.trim() || $('amount').value.trim() || $('conf').value.trim()) {
        e.preventDefault();
        window.open(this.href, '_blank', 'noopener');
      }
    });
  });

  /* ---------- Submit (two-click arming, zero native dialogs!) ---------- */
  function submit(mode) {
    if (mode === 'send' && keyScope === 'draft') {
      disarm();
      showResult(false, '&#10060; NOT SENT &mdash; this browser holds the <b>draft-only key</b>, which cannot send. Use <b>Create Gmail Draft</b>, or save the full key in the Universal Sender&rsquo;s settings.');
      return;
    }
    var r = render();
    if (r.missing.length) {
      showResult(false, '&#9888;&#65039; NOT SENT — please fill in: <b>' + r.missing.map(esc).join(', ') + '</b>');
      return;
    }
    if (r.problems.length) {
      showResult(false, '&#9888;&#65039; NOT SENT — failed checks: <b>' + r.problems.map(esc).join(' · ') + '</b>');
      return;
    }

    var url = ($('gwUrl').value || localStorage.getItem(LS.url) || '').trim();
    var secret = ($('gwSecret').value || localStorage.getItem(LS.secret) || '').trim();
    if (!url || !secret) {
      $('settingsCard').open = true;
      $('settingsCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showResult(false, '&#9888;&#65039; Gateway not configured — enter the Gateway URL &amp; Secret in Settings at the top of the page.');
      return;
    }
    if (!isGatewayUrl(url)) { $('settingsCard').open = true; showResult(false, BAD_URL_MSG); return; }

    var to = $('to').value.trim();
    if (mode === 'send') {
      if (!to) { $('to').focus(); showResult(false, '&#9888;&#65039; NOT SENT — "Send Now" needs the customer email.'); return; }
      if (!armed) {
        armed = true;
        $('sendBtn').classList.add('armed');
        $('sendBtn').textContent = '⚠️ Click again to send to ' + to;
        showResult('warn', 'Ready — click the orange button once more within 10s to send this receipt to <b>' + esc(to) + '</b>.');
        clearTimeout(armTimer);
        armTimer = setTimeout(disarm, 10000);
        return;
      }
      disarm();
    }

    $('draftBtn').disabled = true; $('sendBtn').disabled = true;
    showResult(true, mode === 'send' ? 'Sending receipt…' : 'Creating Gmail draft…');
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 45000);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: secret, mode: mode, to: to,
        subject: safeSubject($('subject').value.trim() || 'your payment receipt'),
        html: asciiHtml(r.html), bcc: 'Save@BillLayneInsurance.com',
        fromName: 'Bill Layne Insurance'
      }),
      redirect: 'follow', signal: ctrl.signal
    }).then(function (res) { return res.json(); })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error || 'Gateway error.');
        if (d.senderEmail) localStorage.setItem(LS.senderEmail, d.senderEmail);
        var quota = typeof d.remainingQuota === 'number' ? ' · ' + d.remainingQuota + ' sends left today' : '';
        var link = gmailLinkFor(d);
        var draftLabel = d.messageId ? 'Open this Draft in Gmail →' : 'Open Gmail Drafts →';
        showResult(true, d.mode === 'send'
          ? '✅ Receipt sent to <b>' + esc(d.to) + '</b> — <a href="' + link + '" target="_blank" rel="noopener">Open Gmail Sent →</a>' + quota
          : '✅ Draft created' + (d.to ? ' for <b>' + esc(d.to) + '</b>' : '') + ' — <a href="' + link + '" target="_blank" rel="noopener">' + draftLabel + '</a>' + quota);
      })
      .catch(function (e) {
        showResult(false, '❌ ' + esc(e && e.name === 'AbortError' ? 'The gateway took too long (45s). Try again.' : (e && e.message) || 'Unknown error'));
      })
      .then(function () { clearTimeout(t); $('draftBtn').disabled = false; $('sendBtn').disabled = false; render(); });
  }

  $('draftBtn').addEventListener('click', function () { disarm(); submit('draft'); });
  $('sendBtn').addEventListener('click', function () { submit('send'); });
  $('copyBtn').addEventListener('click', function () {
    var html = render().html;
    navigator.clipboard.writeText(html).then(function () {
      showResult(true, '📋 Receipt HTML copied to clipboard.');
    }, function () {
      showResult(false, 'Could not copy — browser blocked clipboard access.');
    });
  });
  $('newBtn').addEventListener('click', function () { location.replace('receipt.html'); });

  /* ---------- Prefill from #d= (Chrome Extension hand-off) ---------- */
  function prefillFromHash() {
    var m = /[#&]d=([A-Za-z0-9_-]+)/.exec(location.hash || '');
    if (!m) return;
    try {
      var pad = m[1].length % 4 ? m[1] + '==='.slice((m[1].length % 4) - 1) : m[1];
      var json = atob(pad.replace(/-/g, '+').replace(/_/g, '/'));
      var d = JSON.parse(decodeURIComponent(escape(json)));
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      if (d.first) $('first').value = d.first;
      if (d.last) $('last').value = d.last;
      if (d.to) $('to').value = d.to;
      if (d.amount) $('amount').value = d.amount;
      if (d.date) $('pdate').value = d.date;
      if (d.time) $('ptime').value = d.time;
      if (d.method) $('method').value = d.method;
      if (d.conf) $('conf').value = d.conf;
      if (d.txn) $('txn').value = d.txn;
      if (d.policy) $('policy').value = d.policy;
      if (d.ptype) $('ptype').value = d.ptype;
      if (d.carrier) {
        var idx = CARRIERS.findIndex(function (c) { return c.name.toLowerCase() === String(d.carrier).toLowerCase(); });
        if (idx >= 0) { sel.value = String(idx); }
        else { sel.value = 'other'; $('customCarrierWrap').style.display = 'block'; $('carrierName').value = d.carrier; }
      }
      showResult(true, '&#9989; Pre-filled from the captured page — double-check every field against the confirmation screen before drafting.');
    } catch (e) { /* bad payload - start blank */ }
  }

  /* ---------- Init ---------- */
  document.addEventListener('input', disarm, true);
  document.addEventListener('change', disarm, true);
  var today = new Date();
  $('pdate').value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  ['first','last','amount','ptime','method','conf','txn','policy','carrierName','carrierLegal'].forEach(function (id) {
    $(id).addEventListener('input', render);
  });
  ['pdate','cstart','cend','ptype'].forEach(function (id) { $(id).addEventListener('change', render); });
  $('carrierName').addEventListener('input', autoSubject);
  loadSettings();
  prefillFromHash();
  autoSubject();
  render();
})();
