/**
 * BLI Mail Gateway - Chrome Side Panel (v1.2.0).
 *
 * Captures the rendered email template from the active tab (or accepts
 * pasted/dropped HTML), strips preview toolbars/scripts while keeping
 * Schema.org JSON-LD, upgrades base64 600px spacers, entity-encodes
 * non-ASCII emojis, attaches optional PDFs, and posts to BLI Mail Gateway.
 */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
  const DEFAULT_AUTHUSER = 'bill@billlayneinsurance.com';
  const RECEIPT_BUILDER_URL = 'https://www.billlayneinsurance.com/mail-gateway/receipt.html';

  const state = {
    html: '',
    stripped: [],
    source: '',
    pageText: '',
    pageUrl: '',
    pageTitle: '',
    looksLikePayment: false,
    senderEmail: ''
  };

  let attachments = [];
  const MAX_ATTACH = 5, MAX_ATTACH_BYTES = 18 * 1024 * 1024;
  let sendArmed = false, overrideArmed = false, armTimer = null;
  const SEND_LABEL = $('sendBtn').innerHTML;
  const DRAFT_LABEL = $('draftBtn').innerHTML;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showResult(kind, htmlMsg) {
    const r = $('result');
    r.className = kind === true ? 'ok' : (kind === 'warn' ? 'warn' : 'err');
    r.innerHTML = htmlMsg;
    r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function disarmAll() {
    sendArmed = false;
    overrideArmed = false;
    clearTimeout(armTimer);
    $('sendBtn').classList.remove('armed');
    $('sendBtn').innerHTML = SEND_LABEL;
    $('draftBtn').classList.remove('armed');
    $('draftBtn').innerHTML = DRAFT_LABEL;
  }
  document.addEventListener('input', disarmAll, true);
  document.addEventListener('change', disarmAll, true);

  function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    opts.signal = ctrl.signal;
    return fetch(url, opts).finally(() => clearTimeout(t));
  }

  /* ---------------- settings & secret-verified ping ---------------- */

  function updateDefaultsSummary() {
    const bcc = $('bccInput').value.trim();
    const cc = $('ccInput').value.trim();
    const parts = [bcc ? ('&#128274; BCC: ' + esc(bcc)) : '&#9888;&#65039; No BCC'];
    if (cc) parts.push('CC: ' + esc(cc));
    $('defaultsSummary').innerHTML = parts.join(' &middot; ');
  }

  async function loadSettings() {
    const s = await chrome.storage.local.get({
      gatewayUrl: '',
      gatewaySecret: '',
      fromName: 'Bill Layne Insurance',
      bcc: 'Save@BillLayneInsurance.com',
      senderEmail: ''
    });
    $('gwUrl').value = s.gatewayUrl;
    $('gwSecret').value = s.gatewaySecret;
    $('fromNameInput').value = s.fromName;
    $('bccInput').value = s.bcc;
    state.senderEmail = s.senderEmail || '';
    updateDefaultsSummary();

    if (!s.gatewayUrl || !s.gatewaySecret) {
      $('settingsCard').open = true;
      $('connBadge').className = 'badge err';
      $('connBadge').textContent = 'Gateway: setup needed';
    } else {
      $('settingsCard').open = false;
      $('setStatus').textContent = '— saved ✓';
      pingGateway(true);
    }
  }

  async function saveSettings() {
    const url = $('gwUrl').value.trim();
    const secret = $('gwSecret').value.trim();
    await chrome.storage.local.set({ gatewayUrl: url, gatewaySecret: secret });
    $('setStatus').textContent = (url && secret) ? '— saved ✓' : '';
    if (url && url.indexOf('/exec') === -1) {
      showResult('warn', 'Heads up: the gateway URL usually ends in <code>/exec</code>.');
      return;
    }
    if (url && secret) {
      $('settingsCard').open = false;
      pingGateway(false);
    } else {
      showResult('warn', 'Enter both Gateway URL and Secret, then Save &amp; Test.');
    }
  }

  $('saveSettings').addEventListener('click', saveSettings);
  $('showSecret').addEventListener('click', function () {
    const f = $('gwSecret');
    f.type = f.type === 'password' ? 'text' : 'password';
    this.textContent = f.type === 'password' ? 'Show' : 'Hide';
  });

  ['fromNameInput', 'bccInput', 'ccInput'].forEach((id) => {
    $(id).addEventListener('input', updateDefaultsSummary);
    if (id !== 'ccInput') {
      $(id).addEventListener('change', () => {
        chrome.storage.local.set(id === 'fromNameInput'
          ? { fromName: $(id).value }
          : { bcc: $(id).value });
      });
    }
  });

  async function pingGateway(silent) {
    const url = $('gwUrl').value.trim();
    const secret = $('gwSecret').value.trim();
    const badge = $('connBadge');
    if (!url) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: enter URL';
      return;
    }
    badge.className = 'badge';
    badge.textContent = 'Gateway: checking…';
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ secret, mode: 'ping' }),
        redirect: 'follow'
      }, 22000);
      const d = await res.json();
      if (d && d.ok) {
        if (d.senderEmail) {
          state.senderEmail = d.senderEmail;
          chrome.storage.local.set({ senderEmail: d.senderEmail });
        }
        const q = typeof d.remainingQuota === 'number' ? ' · ' + d.remainingQuota + ' left' : '';
        badge.className = 'badge ok';
        badge.textContent = 'Gateway: connected ✓ (v' + (d.version || '1.3') + q + ')';
        if (!silent) showResult(true, '&#9989; Connected &amp; secret verified' + q + '.');
      } else if (d && /mode must be/i.test(d.error || '')) {
        badge.className = 'badge ok';
        badge.textContent = 'Gateway: connected ✓ (v1.2)';
        if (!silent) showResult(true, '&#9989; Connected &amp; secret verified (v1.2).');
      } else {
        badge.className = 'badge err';
        badge.textContent = 'Gateway: wrong secret';
        $('settingsCard').open = true;
        if (!silent) showResult(false, '&#10060; ' + esc((d && d.error) || 'Secret mismatch'));
      }
    } catch (e) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: unreachable';
      if (!silent) showResult(false, '&#10060; Could not reach Gateway URL.');
    }
  }
  $('testConn').addEventListener('click', () => pingGateway(false));

  /* ---------------- HTML Cleaners & Pre-Flight QA ---------------- */

  function extractTitle(html) {
    const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || '');
    if (!m) return '';
    const d = document.createElement('textarea');
    d.innerHTML = m[1].replace(/<[^>]+>/g, '');
    return d.value.replace(/\s+/g, ' ').trim();
  }

  function extractSubject(html, fallbackTitle) {
    const m = /<!--\s*SUBJECT:\s*([\s\S]*?)\s*-->/i.exec(html || '');
    if (m && m[1].trim()) {
      const d = document.createElement('textarea');
      d.innerHTML = m[1];
      return d.value.replace(/\s+/g, ' ').trim();
    }
    return fallbackTitle || extractTitle(html);
  }

  function cleanEmailWithReport(rawHtml) {
    if (!rawHtml) return { html: '', stripped: [] };
    const stripped = [];
    let out = String(rawHtml);

    if (/id=["']bli-send-toolbar["']/i.test(out)) stripped.push('Designer toolbar');
    if (/id=["']preview-toolbar["']/i.test(out)) stripped.push('Preview toolbar');

    out = out.replace(/^\s*<!--\s*SUBJECT:[\s\S]*?-->\s*/i, '');
    out = out.replace(/<!--[^>]*PREVIEW TOOLBAR[^>]*-->\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']bli-send-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
    out = out.replace(/<div\b[^>]*\bid=["']preview-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
    // Strip browser extension injected overlays (Grammarly, etc.)
    out = out.replace(/<grammarly-[a-z-]+[\s\S]*?<\/grammarly-[a-z-]+>\s*/gi, '');
    // Strip executable scripts while keeping <script type="application/ld+json">
    out = out.replace(/<script\b(?![^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');

    const beforeSpacer = out;
    out = out.replace(/(<img\b[^>]*?\bsrc=["'])data:image\/png;base64,[A-Za-z0-9+\/=]+(["'][^>]*?\bwidth=["']600["'])/gi,
      (_, a, b) => a + SPACER_URL + b);
    if (out !== beforeSpacer) stripped.push('600px spacer');

    return { html: out, stripped };
  }

  function asciiHtml(html) {
    let out = '';
    for (let i = 0; i < html.length; i++) {
      const cp = html.codePointAt(i);
      if (cp > 126) {
        out += '&#x' + cp.toString(16).toUpperCase() + ';';
        if (cp > 0xFFFF) i++;
      } else {
        out += html.charAt(i);
      }
    }
    return out;
  }

  function safeSubject(s) {
    return String(s || '').replace(/[\uD800-\uDFFF]/g, '').replace(/\s+/g, ' ').trim();
  }

  function inspectEmail(cleanedHtml) {
    const bytes = new Blob([cleanedHtml]).size;
    const kb = (bytes / 1024).toFixed(1);
    const errors = [];
    const tokens = cleanedHtml.match(/\{\{[A-Za-z0-9_ -]{2,40}\}\}/g);
    if (tokens) errors.push('Unfilled ' + Array.from(new Set(tokens)).slice(0, 2).join(', '));
    if (/__cf_email__|cdn-cgi\/l\/email-protection|data-cfemail/i.test(cleanedHtml)) {
      errors.push('Cloudflare link corruption');
    }
    return { bytes, kb, errors };
  }

  function setEmailHtml(rawHtml, sourceLabel, fallbackTitle, overwriteSubj) {
    disarmAll();
    const rep = cleanEmailWithReport(rawHtml || '');
    state.html = rep.html;
    state.stripped = rep.stripped;
    state.source = sourceLabel || '';

    const qaBar = $('qaBar');
    if (!state.html.trim()) {
      qaBar.innerHTML = '<span class="qa-pill">No email loaded yet</span>';
      $('preview').srcdoc = '<body style="font-family:sans-serif;color:#94a3b8;display:grid;place-items:center;height:100vh;margin:0;font-size:12.5px">Preview appears here</body>';
      return;
    }

    const qa = inspectEmail(state.html);
    const pills = [];
    const sizeCls = qa.bytes > 102400 ? 'err' : (qa.bytes > 98 * 1024 ? 'warn' : 'ok');
    pills.push('<span class="qa-pill ' + sizeCls + '">' + esc(sourceLabel || 'Loaded') + ' · ' + qa.kb + ' KB</span>');
    if (qa.bytes > 100 * 1024) pills.push('<span class="qa-pill warn">&#9888; Near/over 102 KB clip</span>');
    qa.errors.forEach((er) => pills.push('<span class="qa-pill err">&#10060; ' + esc(er) + '</span>'));
    if (rep.stripped.length) pills.push('<span class="qa-pill ok">&#10003; Cleaned: ' + esc(rep.stripped.join(', ')) + '</span>');
    qaBar.innerHTML = pills.join('');

    $('preview').srcdoc = state.html;
    if (overwriteSubj || !$('subjectInput').value.trim()) {
      const subj = extractSubject(rawHtml, fallbackTitle);
      if (subj) $('subjectInput').value = safeSubject(subj);
    }
  }

  /* ---------------- Capture & Manual Intake ---------------- */

  function capturePageHtml() {
    const doctype = document.doctype ? '<!doctype html>\n' : '';
    return {
      html: doctype + document.documentElement.outerHTML,
      title: document.title || '',
      url: location.href,
      text: ((document.body && document.body.innerText) || '').slice(0, 60000)
    };
  }

  function applyCapture(cap) {
    if (!cap) return;
    if (cap.error) { showResult(false, esc(cap.error)); return; }
    const isNewPage = !!cap.url && cap.url !== state.pageUrl;
    state.pageText = cap.text || '';
    state.pageUrl = cap.url || '';
    state.pageTitle = cap.title || '';
    if (isNewPage) {
      $('toInput').value = '';
      $('ccInput').value = '';
      $('subjectInput').value = '';
      attachments = [];
      renderAttachments();
      updateDefaultsSummary();
    }
    let label = 'Captured tab';
    try { label = 'Captured: ' + ((new URL(cap.url)).pathname.split('/').pop() || 'page'); } catch (e) {}
    setEmailHtml(cap.html, label, cap.title, isNewPage);

    state.looksLikePayment = false;
    try {
      const f = extractReceiptFields(state.pageText, state.pageUrl, state.pageTitle);
      // Avoid flagging actual BLI email templates as raw carrier screens
      const isBliEmail = /mailto:Save@BillLayneInsurance\.com|email-container/i.test(cap.html || '');
      state.looksLikePayment = !isBliEmail && !!(f.amount && (f.conf || f.policy));
    } catch (e) {}

    if (state.looksLikePayment) {
      $('receiptBtn').style.boxShadow = '0 0 0 3px rgba(200,168,78,.5)';
      showResult('warn', '&#9888;&#65039; This looks like a <b>carrier payment screen</b>. Click <b>&#129534; Receipt from payment screen</b> above to build a branded receipt.');
    } else {
      $('receiptBtn').style.boxShadow = '';
      showResult(true, '&#9989; Captured &amp; cleaned active tab. Verify preview, then Draft or Send.');
    }
  }

  async function loadPendingCapture() {
    try {
      const { pendingCapture } = await chrome.storage.session.get('pendingCapture');
      applyCapture(pendingCapture);
    } catch (e) {}
  }

  try {
    chrome.storage.session.onChanged.addListener((changes) => {
      if (changes.pendingCapture) applyCapture(changes.pendingCapture.newValue);
    });
  } catch (e) {}

  $('captureBtn').addEventListener('click', async () => {
    showResult(true, 'Capturing…');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active tab found.');
      const url = tab.url || '';
      if (/^(chrome|edge|about|devtools|chrome-extension):/.test(url)) {
        throw new Error('Open the email template in a normal browser tab first.');
      }
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: capturePageHtml
      });
      const r = results && results[0] && results[0].result;
      if (!r || !r.html) throw new Error('Nothing captured — reload the tab and try again.');
      applyCapture(r);
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/Cannot access|cannot be scripted|permission/i.test(msg)) {
        showResult(false, 'Chrome blocked capture. Click the BLI toolbar icon on the template tab first. For local files (<code>file://</code>), enable "Allow access to file URLs" in extension Details.');
      } else {
        showResult(false, esc(msg));
      }
    }
  });

  $('pasteClipBtn').addEventListener('click', async () => {
    try {
      const txt = await navigator.clipboard.readText();
      if (!txt || !txt.trim()) { showResult('warn', 'Clipboard is empty.'); return; }
      $('htmlInput').value = txt;
      state.looksLikePayment = false;
      setEmailHtml(txt.trim(), 'Clipboard', '', true);
      showResult(true, '&#9989; Loaded &amp; cleaned HTML from clipboard.');
    } catch (e) {
      $('htmlInput').focus();
      showResult('warn', 'Paste manually with <b>Ctrl+V</b> inside the box.');
    }
  });

  $('htmlInput').addEventListener('input', function () {
    state.looksLikePayment = false;
    setEmailHtml(this.value.trim(), 'Pasted HTML', '', false);
  });

  function loadHtmlFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      $('htmlInput').value = String(reader.result || '');
      state.looksLikePayment = false;
      setEmailHtml($('htmlInput').value.trim(), 'File: ' + file.name, '', true);
    };
    reader.readAsText(file);
  }

  $('fileInput').addEventListener('change', function () {
    loadHtmlFile(this.files[0]);
    this.value = '';
  });
  $('dropZone').addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'LABEL') return;
    $('fileInput').click();
  });

  /* ---------------- Attachments (up to 5 files, 18 MB) ---------------- */

  function fmtSize(b) {
    return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  }

  function renderAttachments() {
    const ul = $('attachList');
    ul.innerHTML = attachments.map((a, idx) =>
      '<li><span class="att-name">&#128196; ' + esc(a.name) + ' (' + fmtSize(a.size) + ')</span>' +
      '<button type="button" class="att-rm" data-idx="' + idx + '">&times;</button></li>'
    ).join('');
    ul.querySelectorAll('.att-rm').forEach((btn) => {
      btn.addEventListener('click', function () {
        attachments.splice(parseInt(this.dataset.idx, 10), 1);
        disarmAll();
        renderAttachments();
      });
    });
    const tot = attachments.reduce((n, a) => n + a.size, 0);
    $('attachMeter').textContent = attachments.length
      ? '(' + attachments.length + '/5 · ' + fmtSize(tot) + ')'
      : '(optional · up to 5 PDFs)';
  }

  function addAttachFiles(fileList) {
    const files = Array.from(fileList || []);
    let total = attachments.reduce((n, a) => n + a.size, 0);
    const skipped = [];
    const jobs = files.map((f) => {
      if (attachments.length + 1 > MAX_ATTACH || total + f.size > MAX_ATTACH_BYTES) { skipped.push(f.name); return null; }
      total += f.size;
      const slot = { name: f.name, mimeType: f.type || 'application/octet-stream', size: f.size, dataB64: '' };
      attachments.push(slot);
      return new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => { slot.dataB64 = String(r.result || '').split(',')[1] || ''; resolve(); };
        r.onerror = () => { attachments = attachments.filter((a) => a !== slot); skipped.push(f.name); resolve(); };
        r.readAsDataURL(f);
      });
    }).filter(Boolean);
    Promise.all(jobs).then(() => {
      disarmAll();
      renderAttachments();
      if (skipped.length) showResult('warn', 'Skipped (limit 5 files / 18 MB): ' + esc(skipped.join(', ')));
    });
  }

  $('attachInput').addEventListener('change', function () { addAttachFiles(this.files); this.value = ''; });
  $('attachDrop').addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'LABEL') return;
    $('attachInput').click();
  });

  [['dropZone', (files) => loadHtmlFile(files[0])], ['attachDrop', addAttachFiles]].forEach(([id, fn]) => {
    const z = $(id);
    ['dragenter', 'dragover'].forEach((ev) => z.addEventListener(ev, (e) => { e.preventDefault(); z.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => z.addEventListener(ev, (e) => { e.preventDefault(); z.classList.remove('drag'); }));
    z.addEventListener('drop', (e) => fn((e.dataTransfer && e.dataTransfer.files) || []));
  });

  /* ---------------- Submit (Zero window.confirm!) ---------------- */

  function gmailLinkFor(d) {
    const user = encodeURIComponent((d && d.senderEmail) || state.senderEmail || DEFAULT_AUTHUSER);
    const base = 'https://mail.google.com/mail/?authuser=' + user;
    if (d && d.mode === 'send') return base + '#sent';
    if (d && d.messageId) return base + '#drafts/' + encodeURIComponent(d.messageId);
    return base + '#drafts';
  }

  async function submit(mode) {
    const cfg = await chrome.storage.local.get({ gatewayUrl: '', gatewaySecret: '' });
    if (!cfg.gatewayUrl || !cfg.gatewaySecret) {
      $('settingsCard').open = true;
      showResult(false, '&#9888;&#65039; Enter the Gateway URL and Secret above, then Save &amp; Test.');
      return;
    }
    if (!state.html.trim()) {
      showResult(false, '&#9888;&#65039; Capture a template tab or paste HTML first (Step 1).');
      return;
    }

    const to = $('toInput').value.trim();
    if (mode === 'send' && !to) {
      disarmAll();
      $('toInput').focus();
      showResult(false, '&#10060; NOT SENT — "Send Now" requires a recipient in <b>To</b>.');
      return;
    }

    const qa = inspectEmail(state.html);
    const warnings = [];
    if (state.looksLikePayment) warnings.push('Raw payment screen detected (use "Receipt from payment screen" for receipts)');
    if (qa.errors.length) warnings.push(qa.errors.join(', '));

    if (warnings.length && !overrideArmed && !sendArmed) {
      overrideArmed = true;
      const btn = mode === 'send' ? $('sendBtn') : $('draftBtn');
      btn.classList.add('armed');
      btn.textContent = '⚠️ Click again to ' + (mode === 'send' ? 'send anyway' : 'draft anyway');
      showResult('warn', '&#9888;&#65039; Heads up: <b>' + esc(warnings.join(' · ')) + '</b>. Click the orange button again within 10s to proceed anyway.');
      clearTimeout(armTimer);
      armTimer = setTimeout(disarmAll, 10000);
      return;
    }

    if (mode === 'send' && !sendArmed) {
      sendArmed = true;
      $('sendBtn').classList.add('armed');
      $('sendBtn').textContent = '⚠️ Click again to send to ' + to;
      showResult('warn', 'Ready — click the orange button again within 10s to send immediately to <b>' + esc(to) + '</b>.');
      clearTimeout(armTimer);
      armTimer = setTimeout(disarmAll, 10000);
      return;
    }
    disarmAll();

    const payload = {
      secret: cfg.gatewaySecret,
      mode: mode,
      to: to,
      subject: safeSubject($('subjectInput').value),
      html: asciiHtml(state.html),
      cc: $('ccInput').value.trim(),
      bcc: $('bccInput').value.trim(),
      fromName: $('fromNameInput').value.trim(),
      replyTo: $('replyToInput').value.trim()
    };
    if (attachments.length) {
      payload.attachments = attachments.map((a) => ({ name: a.name, mimeType: a.mimeType, dataB64: a.dataB64 }));
    }

    $('draftBtn').disabled = true;
    $('sendBtn').disabled = true;
    showResult(true, mode === 'send' ? 'Sending…' : 'Creating draft…');
    try {
      const res = await fetchWithTimeout(cfg.gatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      }, 45000);
      const d = await res.json().catch(() => {
        throw new Error('Gateway returned a bad response (HTTP ' + res.status + '). Is access set to "Anyone"?');
      });
      if (!d.ok) throw new Error(d.error || 'Gateway error.');
      if (d.senderEmail) {
        state.senderEmail = d.senderEmail;
        chrome.storage.local.set({ senderEmail: d.senderEmail });
      }
      const quota = typeof d.remainingQuota === 'number' ? ' · ' + d.remainingQuota + ' left today' : '';
      const want = attachments.length;
      const att = want ? ((d.attached === want)
        ? ' with <b>' + want + ' file' + (want === 1 ? '' : 's') + '</b>'
        : ' — <b>⚠️ files NOT attached</b>') : '';
      const link = gmailLinkFor(d);
      if (d.mode === 'send') {
        showResult(true, '✅ Sent to <b>' + esc(d.to) + '</b>' + att +
          ' — <a href="' + link + '" target="_blank" rel="noopener">Open Sent →</a>' + quota);
      } else {
        const label = d.messageId ? 'Open Draft in Gmail →' : 'Open Gmail Drafts →';
        showResult(true, '✅ Draft created' + (d.to ? ' for <b>' + esc(d.to) + '</b>' : '') + att +
          ' — <a href="' + link + '" target="_blank" rel="noopener">' + label + '</a>' + quota);
      }
    } catch (e) {
      const msg = e && e.name === 'AbortError'
        ? 'The gateway took too long (45s). Try again.'
        : String((e && e.message) || e);
      showResult(false, '❌ ' + esc(msg));
    } finally {
      $('draftBtn').disabled = false;
      $('sendBtn').disabled = false;
    }
  }

  $('draftBtn').addEventListener('click', () => { disarmAll(); submit('draft'); });
  $('sendBtn').addEventListener('click', () => submit('send'));

  /* ---------------- Clear / Next Customer ---------------- */

  $('clearBtn').addEventListener('click', () => {
    disarmAll();
    state.pageText = '';
    state.pageUrl = '';
    state.pageTitle = '';
    state.looksLikePayment = false;
    $('htmlInput').value = '';
    $('toInput').value = '';
    $('ccInput').value = '';
    $('subjectInput').value = '';
    $('replyToInput').value = '';
    $('receiptBtn').style.boxShadow = '';
    attachments = [];
    renderAttachments();
    updateDefaultsSummary();
    setEmailHtml('', '');
    try { chrome.storage.session.remove('pendingCapture'); } catch (e) {}
    showResult(true, '&#129529; Cleared — ready for the next customer.');
  });

  /* ---------------- Receipt from Payment Screen ---------------- */

  const CARRIER_MATCHERS = [
    { re: /progressive/i, name: 'Progressive' },
    { re: /nationwide/i, name: 'Nationwide' },
    { re: /national\s*general|natgen|integon/i, name: 'National General' },
    { re: /travelers/i, name: 'Travelers' },
    { re: /foremost/i, name: 'Foremost' },
    { re: /dairyland/i, name: 'Dairyland' },
    { re: /hagerty/i, name: 'Hagerty' },
    { re: /alamance/i, name: 'Alamance Farmers Mutual' },
    { re: /grange/i, name: 'NC Grange Mutual' },
    { re: /ncjua|nciua|joint\s*underwriting/i, name: 'NCJUA' },
    { re: /steadily/i, name: 'Steadily' }
  ];

  function toIsoDate(s) {
    if (!s) return '';
    let m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s);
    if (m) {
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      return y + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
    }
    m = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i.exec(s);
    if (m) {
      const months = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
      return m[3] + '-' + String(months[m[1].toLowerCase()]).padStart(2, '0') + '-' + m[2].padStart(2, '0');
    }
    return '';
  }

  function extractReceiptFields(text, url, title) {
    const t = String(text || '');
    const hay = (url || '') + ' ' + (title || '') + ' ' + t.slice(0, 4000);
    const out = {};

    for (const c of CARRIER_MATCHERS) { if (c.re.test(hay)) { out.carrier = c.name; break; } }

    let m = /(?:amount\s*(?:paid|due)?|payment\s*amount|total\s*(?:paid|payment)?|paid)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*\.\d{2})/i.exec(t)
         || /\$\s*([0-9][0-9,]*\.\d{2})/.exec(t);
    if (m) out.amount = m[1].replace(/,/g, '');

    m = /(?:payment\s*date|date\s*(?:paid|of\s*payment|processed)|processed\s*(?:on)?|effective)\s*[:\-]?\s*((?:\d{1,2}\/\d{1,2}\/\d{2,4})|(?:[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}))/i.exec(t)
      || /((?:\d{1,2}\/\d{1,2}\/\d{4})|(?:[A-Za-z]{3,9}\.?\s+\d{1,2},\s+\d{4}))/.exec(t);
    if (m) { const iso = toIsoDate(m[1]); if (iso) out.date = iso; }

    m = /(\d{1,2}:\d{2}\s*(?:AM|PM)(?:\s*[A-Z]{2,3})?)/i.exec(t);
    if (m) out.time = m[1].toUpperCase();

    const confRe = /(?:confirmation|reference|authorization|receipt)[ \t]*(?:number|no\.?|code|#)?[ \t]*[:#]?[ \t]*([A-Za-z0-9][A-Za-z0-9-]{4,24})\b/gi;
    let cm;
    while ((cm = confRe.exec(t))) { if (/\d/.test(cm[1])) { out.conf = cm[1]; break; } }

    const polRe = /polic(?:y|ies)[ \t]*(?:number|no\.?|#)?[ \t]*[:#]?[ \t]*([A-Za-z0-9][A-Za-z0-9 -]{4,24}?)(?=[ \t]{2,}|\r|\n|$)/gi;
    while ((cm = polRe.exec(t))) { if (/\d/.test(cm[1])) { out.policy = cm[1].trim(); break; } }

    m = /(visa|mastercard|american\s+express|amex|discover)[^\d\n]{0,25}(\d{4})\b/i.exec(t);
    if (m) {
      out.method = m[1].replace(/\s+/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) + ' ending in ' + m[2];
    } else {
      m = /(checking|savings|bank\s*account|ach|e-?check)[^\d\n]{0,25}(\d{4})\b/i.exec(t);
      if (m) out.method = 'Checking ACH ****' + m[2];
    }

    m = /\b(auto|automobile|home(?:owners?)?|dwelling(?:\s*fire)?|renters?|mobile\s*home|umbrella|motorcycle|boat|business|commercial)\b/i.exec(hay);
    if (m) {
      const map = { automobile: 'Auto', homeowner: 'Home', homeowners: 'Home', home: 'Home', dwelling: 'Dwelling Fire', 'dwelling fire': 'Dwelling Fire', renter: 'Renters', renters: 'Renters', 'mobile home': 'Mobile Home', commercial: 'Business' };
      const k = m[1].toLowerCase().replace(/\s+/g, ' ');
      out.ptype = map[k] || (k.charAt(0).toUpperCase() + k.slice(1));
    }

    m = /(?:insured|customer|account[ \t]*holder|policyholder|name)[ \t]*[:#][ \t]*([A-Za-z][A-Za-z'.-]+(?:[ \t]+[A-Za-z][A-Za-z'.-]+){1,2})/i.exec(t);
    if (m) {
      const parts = m[1].trim().split(/[ \t]+/).filter((p) => /^[A-Z]/.test(p));
      if (parts.length >= 2) { out.first = parts[0]; out.last = parts.slice(1).join(' '); }
    }

    m = /\b([A-Za-z0-9._%+-]+@(?!billlayneinsurance)[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i.exec(t);
    if (m) out.to = m[1];

    return out;
  }

  $('receiptBtn').addEventListener('click', () => {
    if (!state.html && !state.pageText) {
      showResult('warn', 'Capture the carrier payment-confirmation tab first, then click Receipt from payment screen.');
      return;
    }
    let text = state.pageText;
    if (!text) {
      try { text = new DOMParser().parseFromString(state.html, 'text/html').body.innerText || ''; } catch (e) { text = ''; }
    }
    const fields = extractReceiptFields(text, state.pageUrl, state.pageTitle);
    let encoded = '';
    try {
      const json = JSON.stringify(fields);
      encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {}
    const url = RECEIPT_BUILDER_URL + (encoded ? '#d=' + encoded : '');
    chrome.tabs.create({ url });
    const found = Object.keys(fields).length;
    showResult(true, 'Opened Receipt Builder with ' + found + ' field' + (found === 1 ? '' : 's') + ' pre-filled — verify against the confirmation screen before drafting.');
  });

  /* ---------------- Init ---------------- */

  loadSettings();
  setEmailHtml('', '');
  loadPendingCapture();
})();
