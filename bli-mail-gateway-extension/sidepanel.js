/**
 * BLI Mail Gateway - Chrome side panel.
 *
 * Captures the rendered email template from the active tab (or accepts
 * pasted/dropped HTML) and posts it to the BLI Mail Gateway Apps Script
 * endpoint as a Gmail draft or an immediate send.
 *
 * Nothing is transmitted anywhere except to the user-configured gateway
 * URL, and only when the user clicks "Create Gmail Draft" or "Send Now".
 * The gateway URL and secret live in chrome.storage.local on this
 * computer only.
 */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { html: '', source: '', pageText: '', pageUrl: '', pageTitle: '' };
  const RECEIPT_BUILDER_URL = 'https://www.billlayneinsurance.com/mail-gateway/receipt.html';

  /* ---------------- settings ---------------- */

  async function loadSettings() {
    const s = await chrome.storage.local.get({
      gatewayUrl: '',
      gatewaySecret: '',
      fromName: 'Bill Layne Insurance',
      bcc: 'Save@BillLayneInsurance.com'
    });
    $('gwUrl').value = s.gatewayUrl;
    $('gwSecret').value = s.gatewaySecret;
    $('fromNameInput').value = s.fromName;
    $('bccInput').value = s.bcc;
    if (!s.gatewayUrl) {
      $('settingsCard').open = true;
    } else {
      $('setStatus').textContent = '- saved ✓';
    }
  }

  async function saveSettings() {
    const url = $('gwUrl').value.trim();
    const secret = $('gwSecret').value.trim();
    await chrome.storage.local.set({ gatewayUrl: url, gatewaySecret: secret });
    $('setStatus').textContent = url ? '- saved ✓' : '';
    if (url && url.indexOf('/exec') === -1) {
      showResult(false, 'Heads up: the gateway URL usually ends in /exec - double-check you copied the Web app URL.');
    } else {
      showResult(true, 'Settings saved on this computer.');
    }
  }

  $('saveSettings').addEventListener('click', saveSettings);

  $('showSecret').addEventListener('click', function () {
    const f = $('gwSecret');
    f.type = f.type === 'password' ? 'text' : 'password';
    this.textContent = f.type === 'password' ? 'Show' : 'Hide';
  });

  ['fromNameInput', 'bccInput'].forEach((id) => {
    $(id).addEventListener('change', () => {
      chrome.storage.local.set(id === 'fromNameInput'
        ? { fromName: $(id).value }
        : { bcc: $(id).value });
    });
  });

  $('testConn').addEventListener('click', async () => {
    const url = $('gwUrl').value.trim();
    const badge = $('connBadge');
    if (!url) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: enter the URL first';
      return;
    }
    badge.className = 'badge';
    badge.textContent = 'Gateway: testing…';
    try {
      const res = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, 30000);
      const d = await res.json();
      if (d && d.ok) {
        badge.className = 'badge ok';
        badge.textContent = 'Gateway: connected ✓ (v' + (d.version || '?') + ')';
      } else {
        badge.className = 'badge err';
        badge.textContent = 'Gateway: unexpected reply';
      }
    } catch (e) {
      badge.className = 'badge err';
      badge.textContent = 'Gateway: could not reach URL';
    }
  });

  /* ---------------- email HTML intake ---------------- */

  function setEmailHtml(html, sourceLabel, title) {
    state.html = html || '';
    state.source = sourceLabel || '';
    const bytes = new Blob([state.html]).size;
    $('sourceInfo').textContent = state.html
      ? sourceLabel + ' · ' + (bytes / 1024).toFixed(1) + ' KB'
      : 'No email loaded yet';
    $('clipWarn').hidden = bytes < 100 * 1024;
    $('preview').srcdoc = state.html ||
      '<body style="font-family:sans-serif;color:#94a3b8;display:grid;place-items:center;height:100vh;margin:0;font-size:13px">Preview appears here</body>';
    if (state.html && !$('subjectInput').value.trim()) {
      const t = title || extractTitle(state.html);
      if (t) $('subjectInput').value = t;
    }
    const ready = !!state.html;
    $('draftBtn').disabled = !ready;
    $('sendBtn').disabled = !ready;
    $('receiptBtn').disabled = !ready;
  }

  function extractTitle(html) {
    const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html || '');
    if (!m) return '';
    const d = document.createElement('textarea');
    d.innerHTML = m[1].replace(/<[^>]+>/g, '');
    return d.value.replace(/\s+/g, ' ').trim();
  }

  // Injected into the active tab. Must be fully self-contained.
  // Keep in sync with the copy in background.js.
  function capturePageHtml() {
    const doctype = document.doctype ? '<!doctype html>\n' : '';
    return {
      html: doctype + document.documentElement.outerHTML,
      title: document.title || '',
      url: location.href,
      text: ((document.body && document.body.innerText) || '').slice(0, 60000)
    };
  }

  // The toolbar icon click captures in the background (that click carries the
  // activeTab permission) and parks the result in storage.session for us.
  function applyCapture(cap) {
    if (!cap) return;
    if (cap.error) { showResult(false, esc(cap.error)); return; }
    // Capturing a DIFFERENT page starts a new job: reset recipient + subject
    // so back-to-back customers never inherit each other's details.
    // Re-capturing the same page (template tweaks) keeps what you typed.
    const isNewPage = !!cap.url && cap.url !== state.pageUrl;
    state.pageText = cap.text || '';
    state.pageUrl = cap.url || '';
    state.pageTitle = cap.title || '';
    if (isNewPage) {
      $('toInput').value = '';
      $('ccInput').value = '';
      $('subjectInput').value = '';
    }
    let label = 'Captured tab';
    try { label = 'Captured: ' + ((new URL(cap.url)).pathname.split('/').pop() || 'page'); } catch (e) { /* keep default */ }
    setEmailHtml(cap.html, label, cap.title);
    // Does this capture smell like a carrier payment screen rather than an email template?
    state.looksLikePayment = false;
    try {
      const f = extractReceiptFields(state.pageText, state.pageUrl, state.pageTitle);
      state.looksLikePayment = !!(f.amount && (f.conf || f.policy));
    } catch (e) { /* detection is best-effort */ }
    if (state.looksLikePayment) {
      $('receiptBtn').style.boxShadow = '0 0 0 3px rgba(200,168,78,.45)';
      showResult(true, '&#9888;&#65039; This looks like a <b>payment-confirmation screen</b>. For a customer receipt, use <b>&#129534; Receipt from this page</b> below — don\'t email the raw page.');
    } else {
      $('receiptBtn').style.boxShadow = '';
      showResult(true, 'Captured the open page. Check the preview, then draft or send.');
    }
  }

  async function loadPendingCapture() {
    try {
      const { pendingCapture } = await chrome.storage.session.get('pendingCapture');
      applyCapture(pendingCapture);
    } catch (e) { /* storage.session unavailable - ignore */ }
  }

  try {
    chrome.storage.session.onChanged.addListener((changes) => {
      if (changes.pendingCapture) applyCapture(changes.pendingCapture.newValue);
    });
  } catch (e) { /* older Chrome - icon capture still lands via loadPendingCapture on open */ }

  $('captureBtn').addEventListener('click', async () => {
    showResult(true, 'Capturing…');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active tab found.');
      const url = tab.url || '';
      if (/^(chrome|edge|about|devtools|chrome-extension):/.test(url)) {
        throw new Error('Chrome does not allow capturing this type of page. Open the email template in a normal tab.');
      }
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: capturePageHtml
      });
      const r = results && results[0] && results[0].result;
      if (!r || !r.html) throw new Error('Nothing captured - reload the template tab and try again.');
      applyCapture(r);
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/Cannot access|cannot be scripted|permission/i.test(msg)) {
        showResult(false, 'Chrome blocked the capture. Click the BLI toolbar icon on the template tab first, then capture. For local files (file://), enable "Allow access to file URLs" for this extension in chrome://extensions.');
      } else {
        showResult(false, msg);
      }
    }
  });

  $('htmlInput').addEventListener('input', function () {
    setEmailHtml(this.value.trim(), 'Pasted HTML');
  });

  function loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      $('htmlInput').value = String(reader.result || '');
      setEmailHtml($('htmlInput').value.trim(), 'File: ' + file.name);
    };
    reader.readAsText(file);
  }

  $('fileInput').addEventListener('change', function () {
    loadFile(this.files[0]);
    this.value = '';
  });

  const dz = $('dropZone');
  ['dragenter', 'dragover'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    loadFile(f);
  });

  /* ---------------- send / draft ---------------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showResult(ok, htmlMsg) {
    const r = $('result');
    r.className = ok ? 'ok' : 'err';
    r.innerHTML = htmlMsg;
  }

  function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    opts.signal = ctrl.signal;
    return fetch(url, opts).finally(() => clearTimeout(t));
  }

  async function submit(mode) {
    const cfg = await chrome.storage.local.get({ gatewayUrl: '', gatewaySecret: '' });
    if (!cfg.gatewayUrl || !cfg.gatewaySecret) {
      $('settingsCard').open = true;
      showResult(false, 'Enter the gateway URL and secret first (Gateway settings above), then Save.');
      return;
    }
    if (!state.html) {
      showResult(false, 'Capture or paste the email HTML first (step 1).');
      return;
    }
    if (state.looksLikePayment &&
        !window.confirm('This capture looks like a carrier PAYMENT SCREEN, not an email template.\n\nEmail the raw page anyway?\n\n(For a customer receipt, press Cancel and use "Receipt from this page" instead.)')) {
      return;
    }
    const to = $('toInput').value.trim();
    if (mode === 'send') {
      if (!to) { showResult(false, '"Send Now" needs a To address.'); return; }
      if (!window.confirm('Send this email NOW to: ' + to + '?')) return;
    }
    const payload = {
      secret: cfg.gatewaySecret,
      mode: mode,
      to: to,
      subject: $('subjectInput').value.trim(),
      html: state.html,
      cc: $('ccInput').value.trim(),
      bcc: $('bccInput').value.trim(), // '' means: no BCC
      fromName: $('fromNameInput').value.trim(),
      replyTo: $('replyToInput').value.trim()
    };
    $('draftBtn').disabled = true;
    $('sendBtn').disabled = true;
    showResult(true, mode === 'send' ? 'Sending…' : 'Creating draft…');
    try {
      const res = await fetchWithTimeout(cfg.gatewayUrl, {
        method: 'POST',
        // text/plain keeps this a "simple request" so the browser skips the
        // CORS preflight, which Apps Script web apps cannot answer.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      }, 45000);
      const d = await res.json().catch(() => {
        throw new Error('Gateway returned a bad response (HTTP ' + res.status + '). Is the web app deployed with access "Anyone"?');
      });
      if (!d.ok) throw new Error(d.error || 'Gateway error.');
      const quota = typeof d.remainingQuota === 'number'
        ? ' · ' + d.remainingQuota + ' sends left today'
        : '';
      if (d.mode === 'send') {
        showResult(true, '✅ Sent to <b>' + esc(d.to) + '</b>' + quota);
      } else {
        showResult(true, '✅ Draft created' + (d.to ? ' for <b>' + esc(d.to) + '</b>' : '') +
          ' - <a href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noopener">open Gmail Drafts →</a>' + quota);
      }
    } catch (e) {
      const msg = e && e.name === 'AbortError'
        ? 'The gateway took too long to answer (45s). Try again.'
        : String((e && e.message) || e);
      showResult(false, '❌ ' + esc(msg));
    } finally {
      $('draftBtn').disabled = !state.html;
      $('sendBtn').disabled = !state.html;
    }
  }

  $('draftBtn').addEventListener('click', () => submit('draft'));
  $('sendBtn').addEventListener('click', () => submit('send'));

  /* ---------------- clear / start a new email ---------------- */

  $('clearBtn').addEventListener('click', () => {
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
    setEmailHtml('', '');
    try { chrome.storage.session.remove('pendingCapture'); } catch (e) { /* best effort */ }
    showResult(true, 'Cleared. Capture or paste the next email whenever you\'re ready.');
  });

  /* ---------------- receipt from captured page ---------------- */
  // Best-effort local extraction (no AI, nothing leaves the browser). The
  // receipt builder page shows every field for confirmation before drafting.

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

    // stay on one line ([ \t], never \s) and require a digit in the code
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
    if (!state.html) { showResult(false, 'Capture the confirmation page first (BLI icon or the capture button).'); return; }
    let text = state.pageText;
    if (!text) {
      try { text = new DOMParser().parseFromString(state.html, 'text/html').body.innerText || ''; } catch (e) { text = ''; }
    }
    const fields = extractReceiptFields(text, state.pageUrl, state.pageTitle);
    let encoded = '';
    try {
      const json = JSON.stringify(fields);
      encoded = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { /* open blank builder */ }
    const url = RECEIPT_BUILDER_URL + (encoded ? '#d=' + encoded : '');
    chrome.tabs.create({ url });
    const found = Object.keys(fields).length;
    showResult(true, 'Opened the receipt builder with ' + found + ' field' + (found === 1 ? '' : 's') + ' pre-filled — double-check them against the confirmation screen, then draft from there.');
  });

  /* ---------------- init ---------------- */

  loadSettings();
  setEmailHtml('', '');
  loadPendingCapture();
})();
