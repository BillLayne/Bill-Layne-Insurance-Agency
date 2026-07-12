/**
 * BLI MAIL GATEWAY — v1.0
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
 *   "mode":     "draft" | "send",               // default "draft"
 *   "to":       "customer@example.com",         // required for send; optional for draft
 *   "subject":  "Your Auto Quote",
 *   "html":     "<!doctype html>...",           // the full email HTML
 *   "text":     "plain-text fallback",          // optional; auto-generated if omitted
 *   "cc":       "",                             // optional
 *   "bcc":      "Save@BillLayneInsurance.com",  // omit field = default Save@; "" = no BCC
 *   "replyTo":  "Bill@BillLayneInsurance.com",  // optional
 *   "fromName": "Bill Layne Insurance"          // display name; default below
 * }
 *
 * RESPONSE: { ok:true, mode, draftId?, remainingQuota } or { ok:false, error }
 */

const DEFAULT_BCC = 'Save@BillLayneInsurance.com';
const DEFAULT_FROM_NAME = 'Bill Layne Insurance';
const VERSION = '1.0';

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
  if (!req.secret || String(req.secret) !== secret) {
    return respond_({ ok: false, error: 'Unauthorized: bad or missing secret.' });
  }

  const mode = String(req.mode || 'draft').toLowerCase();
  const to = String(req.to || '').trim();
  const subject = String(req.subject || '').trim() || '(no subject)';
  const html = req.html;

  if (mode !== 'draft' && mode !== 'send') {
    return respond_({ ok: false, error: "mode must be 'draft' or 'send'." });
  }
  if (!html || typeof html !== 'string') {
    return respond_({ ok: false, error: 'html (string) is required.' });
  }
  if (mode === 'send' && !to) {
    return respond_({ ok: false, error: 'to is required when mode is "send".' });
  }

  const text = (req.text && String(req.text)) || textFallback_(html);
  const options = {
    htmlBody: html,
    name: String(req.fromName || DEFAULT_FROM_NAME)
  };
  // bcc: field omitted -> agency default (Save@); explicit "" -> no BCC
  const bcc = (req.bcc === undefined || req.bcc === null) ? DEFAULT_BCC : String(req.bcc).trim();
  if (bcc) options.bcc = bcc;
  if (req.cc) options.cc = String(req.cc).trim();
  if (req.replyTo) options.replyTo = String(req.replyTo).trim();

  try {
    if (mode === 'send') {
      GmailApp.sendEmail(to, subject, text, options);
      console.log('SEND ok -> ' + to + ' | ' + subject);
      return respond_({ ok: true, mode: 'send', to: to, subject: subject, remainingQuota: quota_() });
    }
    const draft = GmailApp.createDraft(to, subject, text, options);
    console.log('DRAFT ok -> ' + (to || '(no recipient)') + ' | ' + subject);
    return respond_({ ok: true, mode: 'draft', draftId: draft.getId(), to: to, subject: subject, remainingQuota: quota_() });
  } catch (err) {
    console.log('ERROR: ' + err);
    return respond_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Crude plain-text fallback so the email has a text part. */
function textFallback_(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800) || 'This message contains an HTML email.';
}

function quota_() {
  try { return MailApp.getRemainingDailyQuota(); } catch (err) { return null; }
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
  const draft = GmailApp.createDraft(me, 'BLI Mail Gateway self-test', 'It works.', {
    htmlBody: '<p style="font-family:Arial,sans-serif;font-size:16px">&#9989; <b>BLI Mail Gateway</b> can create drafts. You can delete this.</p>',
    name: DEFAULT_FROM_NAME
  });
  console.log('Self-test draft created: ' + draft.getId() + ' (check Gmail > Drafts)');
}
