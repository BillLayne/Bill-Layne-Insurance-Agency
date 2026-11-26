(function () {
  'use strict';
  if (window.__bliMailMoved) return;   // old public address: moved.js passes the visitor on, nothing runs here
  var $ = function (id) { return document.getElementById(id); };
  var keyScope = 'full';   // 'draft' once the gateway says this browser holds the draft-only key
  var TPLS = window.BLI_STUDIO.templates;
  var SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
  var DEFAULT_AUTHUSER = 'bill@billlayneinsurance.com';
  var LS = { url: 'bliMailGateway.url', secret: 'bliMailGateway.secret', senderEmail: 'bliMailGateway.senderEmail' };
  var current = TPLS[0];
  var subjectDirty = false;
  var armed = false, armTimer = null;

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

  /* ---------- HTML Wire Cleaners ---------- */
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

  /* ---------- Template Picker & Dynamic Form ---------- */
  var grid = $('tplGrid');
  TPLS.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tpl'; b.dataset.id = t.id;
    b.innerHTML = '<span class="ic">' + t.icon + '</span><span class="nm">' + t.name + '</span><span class="ds">' + t.desc + '</span>';
    b.addEventListener('click', function () { selectTemplate(t.id); });
    grid.appendChild(b);
  });

  function selectTemplate(id) {
    disarm();
    current = TPLS.filter(function (t) { return t.id === id; })[0] || TPLS[0];
    Array.prototype.forEach.call(grid.children, function (el) {
      el.className = 'tpl' + (el.dataset.id === current.id ? ' active' : '');
    });
    buildForm();
    subjectDirty = false;
    autoSubject();
    render();
  }

  function fieldInput(f) {
    var el;
    if (f.type === 'select') {
      el = document.createElement('select');
      f.options.forEach(function (o) {
        var op = document.createElement('option'); op.value = o; op.textContent = o; el.appendChild(op);
      });
    } else if (f.type === 'textarea') {
      el = document.createElement('textarea');
      el.rows = f.rows || 3;
    } else {
      el = document.createElement('input');
      el.type = f.type || 'text';
      el.autocomplete = 'off';
    }
    el.id = 'f_' + f.id;
    if (f.placeholder) el.placeholder = f.placeholder;
    if (f.default === 'today') {
      var d = new Date();
      el.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    var evt = (f.type === 'select' || f.type === 'date') ? 'change' : 'input';
    el.addEventListener(evt, function () { autoSubject(); render(); });
    return el;
  }

  function labelFor(f) {
    var l = document.createElement('label');
    l.htmlFor = 'f_' + f.id;
    l.innerHTML = f.label + (f.required ? ' <span class="req">*</span>' : '');
    return l;
  }

  function buildForm() {
    var area = $('formArea');
    area.innerHTML = '';
    var i = 0, fields = current.fields;
    while (i < fields.length) {
      var f = fields[i];
      if (f.half && fields[i + 1] && fields[i + 1].half) {
        var row = document.createElement('div'); row.className = 'two';
        [f, fields[i + 1]].forEach(function (ff) {
          var w = document.createElement('div');
          w.appendChild(labelFor(ff)); w.appendChild(fieldInput(ff));
          row.appendChild(w);
        });
        area.appendChild(row);
        i += 2;
      } else {
        area.appendChild(labelFor(f));
        area.appendChild(fieldInput(f));
        i += 1;
      }
    }
  }

  function values() {
    var v = {};
    current.fields.forEach(function (f) {
      var el = $('f_' + f.id);
      v[f.id] = el ? el.value : '';
    });
    return v;
  }

  function missingRequired(v) {
    return current.fields.filter(function (f) {
      return f.required && !String(v[f.id] || '').trim();
    }).map(function (f) { return f.label.replace(/\s*\(.*$/, ''); });
  }

  function autoSubject() {
    if (subjectDirty) return;
    $('subject').value = current.subject(values());
  }
  $('subject').addEventListener('input', function () { subjectDirty = true; });

  function integrity(html) {
    var problems = [];
    var m = html.match(/\{\{[A-Z_]+\}\}/);
    if (m) problems.push('unfilled variable ' + m[0]);
    ['cdn-cgi', '__cf_email__', 'email-protection', 'XacnUW4', 'border-radius:50%'].forEach(function (bad) {
      if (html.indexOf(bad) !== -1) problems.push('forbidden string: ' + bad);
    });
    if (html.indexOf('mailto:Save@BillLayneInsurance.com') === -1) problems.push('Save@ mailto missing');
    if (new Blob([html]).size > 102400) problems.push('over Gmail 102 KB clip limit');
    return problems;
  }

  function render() {
    var v = values();
    var html = upgradeSpacer(current.build(v));
    $('preview').srcdoc = html;
    var probs = integrity(html);
    var missing = missingRequired(v);
    var parts = [];
    if (missing.length) parts.push('<span class="bad">missing: ' + missing.map(esc).join(', ') + '</span>');
    if (probs.length) parts.push('<span class="bad">' + probs.map(esc).join(' &middot; ') + '</span>');
    $('checks').innerHTML = parts.length
      ? 'Checks: ' + parts.join(' &middot; ')
      : 'Checks: all clear ✓ (' + (new Blob([html]).size / 1024).toFixed(1) + ' KB)';
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
      var v = values();
      var dirty = $('to').value.trim() || Object.keys(v).some(function (k) { return k === 'first' && String(v[k] || '').trim(); });
      if (dirty) { e.preventDefault(); window.open(this.href, '_blank', 'noopener'); }
    });
  });

  /* ---------- Submit ---------- */
  function submit(mode) {
    if (mode === 'send' && keyScope === 'draft') {
      disarm();
      showResult(false, '&#10060; NOT SENT &mdash; this browser holds the <b>draft-only key</b>, which cannot send. Use <b>Create Gmail Draft</b>, or save the full key in the Universal Sender&rsquo;s settings.');
      return;
    }
    var r = render();
    if (r.missing.length) { showResult(false, '&#9888;&#65039; NOT SENT — please fill in: <b>' + r.missing.map(esc).join(', ') + '</b>'); return; }
    if (r.problems.length) { showResult(false, '&#9888;&#65039; NOT SENT — failed checks: <b>' + r.problems.map(esc).join(' · ') + '</b>'); return; }

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
        showResult('warn', 'Ready — click the orange button once more within 10s to send to <b>' + esc(to) + '</b>.');
        clearTimeout(armTimer);
        armTimer = setTimeout(disarm, 10000);
        return;
      }
      disarm();
    }

    $('sendBtn').disabled = true; $('draftBtn').disabled = true;
    showResult(true, mode === 'send' ? 'Sending…' : 'Creating Gmail draft…');
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 45000);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        secret: secret, mode: mode, to: to,
        subject: safeSubject($('subject').value.trim() || current.subject(values())),
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
          ? '✅ SENT! Your ' + esc(current.name) + ' is on its way to <b>' + esc(d.to) + '</b> — <a href="' + link + '" target="_blank" rel="noopener">Open Gmail Sent →</a>' + quota
          : '✅ Draft created' + (d.to ? ' for <b>' + esc(d.to) + '</b>' : '') + ' — <a href="' + link + '" target="_blank" rel="noopener">' + draftLabel + '</a>' + quota);
      })
      .catch(function (e) {
        showResult(false, '❌ ' + esc(e && e.name === 'AbortError' ? 'The gateway took too long (45s). Try again.' : (e && e.message) || 'Unknown error'));
      })
      .then(function () { clearTimeout(t); $('sendBtn').disabled = false; $('draftBtn').disabled = false; render(); });
  }

  $('draftBtn').addEventListener('click', function () { disarm(); submit('draft'); });
  $('sendBtn').addEventListener('click', function () { submit('send'); });
  $('copyBtn').addEventListener('click', function () {
    var html = render().html;
    navigator.clipboard.writeText(html).then(function () {
      showResult(true, '📋 Full email HTML copied to clipboard.');
    }, function () {
      showResult(false, 'Could not copy — your browser blocked clipboard access.');
    });
  });
  $('newBtn').addEventListener('click', function () { location.replace('studio.html'); });

  document.addEventListener('input', disarm, true);
  document.addEventListener('change', disarm, true);
  loadSettings();
  selectTemplate(TPLS[0].id);
})();
