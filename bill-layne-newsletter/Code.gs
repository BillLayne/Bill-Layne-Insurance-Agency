// ═══════════════════════════════════════════════════════════════════════════════
// BILL LAYNE INSURANCE AGENCY — Monthly Newsletter Sender
// Google Apps Script Backend — Code.gs
//
// SETUP:
//   1. Replace OPT_OUT_SHEET_ID with your Google Sheet ID
//   2. Deploy as Web App: Execute as Me | Access: Anyone
//   3. Paste the Web App URL into the React app's Send tab
//
// HOW IT WORKS:
//   POST  → Receives recipients + HTML from React app, sends emails via Gmail
//   GET   → Handles unsubscribe link clicks, adds email to Google Sheet
// ═══════════════════════════════════════════════════════════════════════════════

const OPT_OUT_SHEET_ID  = 'YOUR_GOOGLE_SHEET_ID_HERE'; // ← Replace this
const OPT_OUT_TAB_NAME  = 'Opt-Outs';
const SEND_LOG_TAB_NAME = 'Send Log';
const SEND_DELAY_MS     = 150; // 150ms between sends ≈ 400/min, well under Gmail limit
const AGENCY_NAME       = 'Bill Layne Insurance Agency';
const REPLY_TO          = 'Save@BillLayneInsurance.com';
const BCC_ADDRESS       = 'Save@BillLayneInsurance.com';

// ──────────────────────────────────────────────────────────────────────────────
// doPost — Receives the newsletter send request from the React app
// ──────────────────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { subject, preheader, htmlBody, recipients } = payload;

    // Validate required fields
    if (!subject)              return jsonResponse({ status: 'error', message: 'Missing subject.' });
    if (!htmlBody)             return jsonResponse({ status: 'error', message: 'Missing htmlBody.' });
    if (!recipients || !recipients.length) return jsonResponse({ status: 'error', message: 'No recipients provided.' });

    // Load opt-out list once (not on every send)
    const optOuts    = getOptOutSet();
    const scriptUrl  = ScriptApp.getService().getUrl();
    let sent = 0, skipped = 0;

    for (const recipient of recipients) {
      const emailLower = (recipient.email || '').toLowerCase().trim();

      // Skip invalid or opted-out emails
      if (!emailLower || !emailLower.includes('@')) { skipped++; continue; }
      if (optOuts.has(emailLower))                   { skipped++; continue; }

      try {
        const personalizedHtml = buildPersonalizedEmail(htmlBody, recipient, preheader, scriptUrl);

        GmailApp.sendEmail(emailLower, subject, '', {
          htmlBody:  personalizedHtml,
          name:      AGENCY_NAME,
          replyTo:   REPLY_TO,
          bcc:       BCC_ADDRESS,
          noReply:   false,
        });

        sent++;
        Utilities.sleep(SEND_DELAY_MS); // Rate limiting

      } catch (sendErr) {
        // Log individual send failures but continue sending to others
        Logger.log('Send failed for ' + emailLower + ': ' + sendErr.message);
        skipped++;
      }
    }

    // Log the send to Google Sheet
    logSendEvent(sent, skipped, subject);

    return jsonResponse({
      status:  'success',
      message: 'Sent ' + sent + ' emails. Skipped ' + skipped + ' (opted out or invalid).',
      sent:    sent,
      skipped: skipped,
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// doGet — Handles unsubscribe link clicks
// ──────────────────────────────────────────────────────────────────────────────
function doGet(e) {
  const action = ((e.parameter && e.parameter.action) || '').toLowerCase();
  const email  = ((e.parameter && e.parameter.email)  || '').toLowerCase().trim();

  if (action === 'optout' && email && email.includes('@')) {
    addToOptOutSheet(email);
    return buildUnsubscribePage(email);
  }

  // Invalid request
  return HtmlService.createHtmlOutput(
    '<p style="font-family:Arial;color:#64748b;padding:40px;">Invalid request. Please contact Save@BillLayneInsurance.com.</p>'
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// buildPersonalizedEmail — Injects personalization tokens + unsubscribe block
// ──────────────────────────────────────────────────────────────────────────────
function buildPersonalizedEmail(html, recipient, preheader, scriptUrl) {
  const optOutUrl = scriptUrl + '?action=optout&email=' + encodeURIComponent(recipient.email);
  const firstName = recipient.firstName || 'Friend';
  const fullName  = recipient.displayName || 'Valued Customer';

  // Build unsubscribe anchor for inline use
  const unsubAnchor =
    '<a href="' + optOutUrl + '" style="color:#94a3b8;text-decoration:underline;' +
    'font-family:Arial,sans-serif;font-size:11px;">Unsubscribe</a>';

  // Build unsubscribe paragraph for injection before </body>
  const unsubBlock =
    '<div style="text-align:center;padding:8px 24px 16px;">' +
    '<p style="font-size:11px;color:#94a3b8;margin:0;font-family:Arial,sans-serif;">' +
    'You received this because you are a client of Bill Layne Insurance Agency. ' +
    '<br>' + unsubAnchor + ' from future newsletters.</p></div>';

  // Build preheader ghost text block
  const preheaderBlock = preheader
    ? '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;' +
      'color:#f1f5f9;line-height:1px;">' + preheader +
      '&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;' +
      '&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>'
    : '';

  // Replace personalization tokens
  let out = html
    .replace(/\{\{FIRST_NAME\}\}/g,       firstName)
    .replace(/\{\{FULL_NAME\}\}/g,        fullName)
    .replace(/\{\{EMAIL\}\}/g,            recipient.email)
    .replace(/\{\{UNSUBSCRIBE_LINK\}\}/g, unsubAnchor)
    .replace(/\{\{OPT_OUT_URL\}\}/g,      optOutUrl);

  // Inject preheader right after <body> (if not already present in template)
  if (preheaderBlock && !out.includes('mso-hide:all')) {
    out = out.replace(/(<body[^>]*>)/i, '$1' + preheaderBlock);
  }

  // Inject unsubscribe block before </body>
  out = out.replace(/<\/body>/i, unsubBlock + '</body>');

  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// getOptOutSet — Returns a Set of opted-out email addresses (lowercase)
// ──────────────────────────────────────────────────────────────────────────────
function getOptOutSet() {
  const ss    = SpreadsheetApp.openById(OPT_OUT_SHEET_ID);
  const sheet = getOrCreateSheet(ss, OPT_OUT_TAB_NAME, ['Email', 'Date Added', 'Source']);
  const rows  = sheet.getDataRange().getValues();
  const set   = new Set();
  for (let i = 1; i < rows.length; i++) {
    const email = (rows[i][0] || '').toString().toLowerCase().trim();
    if (email) set.add(email);
  }
  return set;
}

// ──────────────────────────────────────────────────────────────────────────────
// addToOptOutSheet — Adds one email to the opt-out sheet (no dupes)
// ──────────────────────────────────────────────────────────────────────────────
function addToOptOutSheet(email) {
  const ss    = SpreadsheetApp.openById(OPT_OUT_SHEET_ID);
  const sheet = getOrCreateSheet(ss, OPT_OUT_TAB_NAME, ['Email', 'Date Added', 'Source']);
  const rows  = sheet.getDataRange().getValues();

  // Check if already opted out
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i][0] || '').toString().toLowerCase() === email) return; // Already in list
  }

  // Add new opt-out
  sheet.appendRow([email, new Date().toISOString(), 'Unsubscribe link click']);
  Logger.log('Opt-out recorded: ' + email);
}

// ──────────────────────────────────────────────────────────────────────────────
// logSendEvent — Records send summary to Send Log tab
// ──────────────────────────────────────────────────────────────────────────────
function logSendEvent(sent, skipped, subject) {
  const ss    = SpreadsheetApp.openById(OPT_OUT_SHEET_ID);
  const sheet = getOrCreateSheet(ss, SEND_LOG_TAB_NAME, ['Date', 'Subject', 'Sent', 'Skipped', 'Total']);
  sheet.appendRow([new Date(), subject, sent, skipped, sent + skipped]);
}

// ──────────────────────────────────────────────────────────────────────────────
// getOrCreateSheet — Gets or creates a named sheet with headers
// ──────────────────────────────────────────────────────────────────────────────
function getOrCreateSheet(ss, tabName, headers) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#003f87');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ──────────────────────────────────────────────────────────────────────────────
// buildUnsubscribePage — Returns a branded HTML confirmation page
// ──────────────────────────────────────────────────────────────────────────────
function buildUnsubscribePage(email) {
  const html =
    '<!DOCTYPE html><html><head>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Unsubscribed — Bill Layne Insurance</title>' +
    '<style>' +
    'body{margin:0;padding:0;background:#f1f5f9;font-family:Arial,"Helvetica Neue",Helvetica,sans-serif;' +
    'display:flex;justify-content:center;align-items:center;min-height:100vh;}' +
    '.card{background:#ffffff;border-radius:16px;padding:40px 36px;max-width:480px;width:90%;' +
    'text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);}' +
    '.logo{width:140px;height:auto;margin-bottom:24px;}' +
    '.badge{background:#f0fdf4;color:#059669;border-radius:50px;padding:8px 20px;' +
    'font-weight:700;font-size:14px;display:inline-block;margin-bottom:20px;border:1px solid #86efac;}' +
    'h2{color:#003f87;margin:0 0 8px 0;font-size:22px;}' +
    'p{color:#64748b;line-height:1.6;font-size:14px;margin:0 0 12px 0;}' +
    '.email{color:#94a3b8;font-size:12px;font-family:monospace;}' +
    '.contact-link{color:#003f87;font-weight:600;text-decoration:none;}' +
    '.divider{border:none;border-top:1px solid #e2e8f0;margin:20px 0;}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="card">' +
    '<img src="https://i.imgur.com/lxu9nfT.png" alt="Bill Layne Insurance Agency" class="logo">' +
    '<div class="badge">Successfully Unsubscribed</div>' +
    '<h2>You\'ve been removed.</h2>' +
    '<p>You will no longer receive newsletters from<br><strong>Bill Layne Insurance Agency</strong>.</p>' +
    '<p class="email">' + email + '</p>' +
    '<hr class="divider">' +
    '<p>This only removes you from our newsletter list. You will still receive<br>' +
    'important policy and billing communications.</p>' +
    '<p>Questions? Call us at<br>' +
    '<a href="tel:3368351993" class="contact-link">(336) 835-1993</a>' +
    ' &nbsp;|&nbsp; ' +
    '<a href="mailto:Save@BillLayneInsurance.com" class="contact-link">Save@BillLayneInsurance.com</a></p>' +
    '</div>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html);
}

// ──────────────────────────────────────────────────────────────────────────────
// jsonResponse — Wraps an object as JSON ContentService response
// ──────────────────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────────────────────────────────────
// getOptOutList — Utility function: call from Apps Script editor to see opt-outs
// ──────────────────────────────────────────────────────────────────────────────
function getOptOutList() {
  const optOuts = getOptOutSet();
  Logger.log('Total opt-outs: ' + optOuts.size);
  optOuts.forEach(email => Logger.log(email));
}
