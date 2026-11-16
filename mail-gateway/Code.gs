/**
 * BLI MAIL GATEWAY — v1.3
 * One shared endpoint that lets ANY Bill Layne Insurance tool create a Gmail
 * draft or send an email directly — no more copy-pasting HTML into Gmail.
 *
 * DEPLOY (one time, while logged in as Bill@billlayneinsurance.com):
 *   1. script.google.com -> New project -> name it "BLI Mail Gateway"
 *   2. Paste this whole file over the starter code. Save.
 *   3. Gear icon (Project Settings) -> Script properties -> Add property:
 *        GATEWAY_SECRET = <your secret>
 *   4. In the editor toolbar pick the function `selfTest` -> Run -> authorize
 *      (Advanced -> Go to BLI Mail Gateway -> Allow). A test draft appears
 *      in your Gmail Drafts if everything is working.
 *   5. Deploy -> New deployment -> Web app
 *        Execute as: Me
 *        Who has access: Anyone        <- must be "Anyone", NOT "Anyone with Google account"
 *      Copy the Web app URL (ends in /exec).
 *
 * UPDATES LATER: edit code -> Deploy -> Manage deployments -> pencil ->
 * Version: New version -> Deploy. Same /exec URL (same rule as SendBillDocs).
 *
 * REQUEST (POST, Content-Type: text/plain so the browser skips CORS preflight):
 * {
 *   "secret":   "...",                          // must match GATEWAY_SECRET
 *   "mode":     "draft" | "send" | "ping",      // default "draft" ("ping" verifies secret + quota)
 *   "to":       "customer@example.com",         // required for send; optional for draft
 *   "subject":  "your auto quote",
 *   "html":     "<!doctype html>...",           // the full email HTML (required for draft/send)
 *   "text":     "plain-text fallback",          // optional; auto-generated if omitted
 *   "cc":       "",                             // optional
 *   "bcc":      "Save@BillLayneInsurance.com",  // omit field = default Save@; "" = no BCC
 *   "replyTo":  "Bill@BillLayneInsurance.com",  // optional
 *   "fromName": "Bill Layne Insurance",         // display name; default below
 *   "attachments": [                            // optional (v1.1+) — up to 5, <= 20 MB total
 *     { "name": "policy.pdf", "mimeType": "application/pdf", "dataB64": "<base64>" }
 *   ]
 * }
 *
 * RESPONSE:
 *   { ok:true, mode, version, draftId?, messageId?, attached, senderEmail?, remainingQuota }
 *   or { ok:false, error }
 */

const DEFAULT_BCC = 'Save@BillLayneInsurance.com';
const DEFAULT_FROM_NAME = 'Bill Layne Insurance';
const SPACER_URL = 'https://img.billlayneinsurance.com/i/2026/11/email-spacer-600x1-4rd8em.png';
const MAX_ATTACH_COUNT = 5;
const MAX_ATTACH_BYTES = 20 * 1024 * 1024;
const VERSION = '1.3';

function doGet() {
  return respond_({ ok: true, service: 'BLI Mail Gateway', version: VERSION });
}

function doPost(e) {
  let req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return respond_({ ok: false, error: 'Request body must be a JSON string.' });
  }

  const secret = PropertiesService.getScriptProperties().getProperty('GATEWAY_SECRET');
  if (!secret) {
    return respond_({ ok: false, error: 'GATEWAY_SECRET is not set. Add it under Project Settings > Script properties.' });
  }
  // v1.2+: secret may arrive in JSON body or as ?secret= query parameter (Perplexity vault).
  const provided = req.secret || (e && e.parameter && e.parameter.secret);
  if (!provided || !timingSafeEqual_(String(provided), String(secret))) {
    return respond_({ ok: false, error: 'Unauthorized: bad or missing secret.' });
  }

  const mode = String(req.mode || 'draft').toLowerCase();
  const senderEmail = safeEmail_();

  // v1.3: secret-authenticated health & quota check (sends nothing, creates no draft).
  if (mode === 'ping') {
    return respond_({
      ok: true,
      mode: 'ping',
      service: 'BLI Mail Gateway',
      version: VERSION,
      senderEmail: senderEmail,
      remainingQuota: quota_()
    });
  }

  if (mode !== 'draft' && mode !== 'send') {
    return respond_({ ok: false, error: "mode must be 'draft', 'send', or 'ping'." });
  }

  const to = String(req.to || '').trim();
  const subject = safeSubject_(req.subject) || '(no subject)';
  const rawHtml = req.html;

  if (!rawHtml || typeof rawHtml !== 'string') {
    return respond_({ ok: false, error: 'html (string) is required.' });
  }
  if (mode === 'send' && !to) {
    return respond_({ ok: false, error: 'to is required when mode is "send".' });
  }
  if (to && !validEmailList_(to)) {
    return respond_({ ok: false, error: 'Invalid recipient email format in "to": ' + to });
  }

  // v1.3: server-side idempotent cleanup + hosted spacer swap + non-ASCII entity escaping
  // so every client (Studio, Receipt, Extension, CertGuard, PDF Studio) is immune to
  // GmailApp's 4-byte emoji corruption and preview-toolbar leaks.
  const cleanedHtml = cleanEmail_(rawHtml);
  const safeHtml = asciiHtml_(cleanedHtml);

  const text = (req.text && safeSubject_(req.text)) || textFallback_(cleanedHtml);
  const options = {
    htmlBody: safeHtml,
    name: String(req.fromName || DEFAULT_FROM_NAME)
  };
  // bcc: field omitted -> agency default (Save@); explicit "" -> no BCC
  const bcc = (req.bcc === undefined || req.bcc === null) ? DEFAULT_BCC : String(req.bcc).trim();
  if (bcc) options.bcc = bcc;
  if (req.cc) options.cc = String(req.cc).trim();
  if (req.replyTo) options.replyTo = String(req.replyTo).trim();

  // v1.1+: optional file attachments (base64) — e.g. PDFs from PDF Studio / Universal Sender
  let attached = 0;
  let totalBytes = 0;
  if (Array.isArray(req.attachments) && req.attachments.length) {
    try {
      options.attachments = req.attachments.slice(0, MAX_ATTACH_COUNT).map(function (a) {
        const bytes = Utilities.base64Decode(String(a.dataB64 || ''));
        totalBytes += bytes.length;
        if (totalBytes > MAX_ATTACH_BYTES) {
          throw new Error('Attachments exceed 20 MB total limit.');
        }
        return Utilities.newBlob(
          bytes,
          String(a.mimeType || 'application/octet-stream'),
          String(a.name || 'attachment')
        );
      });
      attached = options.attachments.length;
    } catch (attErr) {
      return respond_({ ok: false, error: 'Bad attachment data: ' + ((attErr && attErr.message) || attErr) });
    }
  }

  try {
    if (mode === 'send') {
      GmailApp.sendEmail(to, subject, text, options);
      console.log('SEND ok -> ' + to + ' | ' + subject + ' | attachments: ' + attached);
      return respond_({
        ok: true,
        mode: 'send',
        version: VERSION,
        to: to,
        subject: subject,
        attached: attached,
        senderEmail: senderEmail,
        remainingQuota: quota_()
      });
    }
    const draft = GmailApp.createDraft(to, subject, text, options);
    let messageId = '';
    try { messageId = draft.getMessage().getId() || ''; } catch (msgErr) {}
    console.log('DRAFT ok -> ' + (to || '(no recipient)') + ' | ' + subject + ' | attachments: ' + attached);
    return respond_({
      ok: true,
      mode: 'draft',
      version: VERSION,
      draftId: draft.getId(),
      messageId: messageId,
      to: to,
      subject: subject,
      attached: attached,
      senderEmail: senderEmail,
      remainingQuota: quota_()
    });
  } catch (err) {
    console.log('ERROR: ' + err);
    return respond_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Constant-time string comparison to avoid secret timing leaks. */
function timingSafeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Strips preview/designer toolbars & executable scripts (preserving JSON-LD Schema.org)
 * and swaps data:image 600px anti-fit spacers to the hosted BLI CDN PNG.
 */
function cleanEmail_(html) {
  let out = String(html || '');
  out = out.replace(/^\s*<!--\s*SUBJECT:[\s\S]*?-->\s*/i, '');
  out = out.replace(/<!--[^>]*PREVIEW TOOLBAR[^>]*-->\s*/gi, '');
  out = out.replace(/<div\b[^>]*\bid=["']bli-send-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
  out = out.replace(/<div\b[^>]*\bid=["']preview-toolbar["'][^>]*>(?:(?!<div\b|<\/div>)[\s\S]|<div\b[^>]*>(?:(?!<div\b|<\/div>)[\s\S])*<\/div>)*<\/div>\s*/gi, '');
  // Strip executable <script> tags while keeping <script type="application/ld+json">
  out = out.replace(/<script\b(?![^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  out = out.replace(/(<img\b[^>]*?\bsrc=["'])data:image\/png;base64,[A-Za-z0-9+\/=]+(["'][^>]*?\bwidth=["']600["'])/gi,
    function (_, a, b) { return a + SPACER_URL + b; });
  return out;
}

/**
 * Idempotent ASCII entity encoder: converts any code point > 126 to &#xHEX;.
 * Prevents GmailApp from corrupting 4-byte UTF-8 emojis into replacement diamonds.
 */
function asciiHtml_(html) {
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

/** Strips astral-plane characters & lone surrogates from subject/plain-text strings. */
function safeSubject_(s) {
  return String(s || '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Basic validation for comma/semicolon-separated email addresses. */
function validEmailList_(raw) {
  const parts = String(raw || '').split(/[,;]/).map(function (p) { return p.trim(); }).filter(Boolean);
  if (!parts.length) return false;
  const re = /^(?:[^<>@]+<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}>?$/;
  return parts.every(function (p) { return re.test(p); });
}

/** Plain-text fallback so the email has a readable text/plain MIME part. */
function textFallback_(html) {
  return safeSubject_(
    String(html)
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&mdash;/gi, '—')
      .replace(/&bull;/gi, '•')
      .replace(/&amp;/gi, '&')
  ).slice(0, 800) || 'This message contains an HTML email from Bill Layne Insurance.';
}

function quota_() {
  try { return MailApp.getRemainingDailyQuota(); } catch (err) { return null; }
}

function safeEmail_() {
  try { return Session.getActiveUser().getEmail() || ''; } catch (err) { return ''; }
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the editor to trigger the authorization prompt and
 * confirm draft creation works. Creates a draft addressed to yourself.
 */
function selfTest() {
  const me = Session.getActiveUser().getEmail();
  const draft = GmailApp.createDraft(me, 'BLI Mail Gateway self-test (v' + VERSION + ')', 'It works.', {
    htmlBody: '<p style="font-family:Arial,sans-serif;font-size:16px">&#9989; <b>BLI Mail Gateway v' + VERSION + '</b> can create drafts. You can delete this.</p>',
    name: DEFAULT_FROM_NAME
  });
  console.log('Self-test draft created: ' + draft.getId() + ' (check Gmail > Drafts)');
}
