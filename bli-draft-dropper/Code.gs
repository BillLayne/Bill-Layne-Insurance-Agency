/**
 * BLI DRAFT DROPPER  —  no-AI fallback for Claude Design email templates
 * ---------------------------------------------------------------------------
 * WHAT IT DOES (every run):
 *   1. Looks in SOURCE_FOLDER_ID ("DROP GMAILS HERE") for HTML files.
 *   2. For each one, creates a Gmail DRAFT with that HTML as the email body,
 *      archive copy to save@billlayneinsurance.com, subject pulled from the file.
 *   3. Moves the file into a "Processed" subfolder (created automatically) so it
 *      is never turned into a draft twice — and nothing is ever deleted.
 *
 * The draft's "To" is left blank on purpose: you add the client and hit Send.
 *
 * Everything lives in My Drive, well away from the BLI Clients shared drive and
 * its daily cleaner — this program never touches _DROP DOCUMENTS HERE.
 *
 * SET UP ONCE:
 *   - Paste this whole file into a new project at https://script.google.com
 *   - Put your "DROP GMAILS HERE" folder ID in SOURCE_FOLDER_ID below.
 *   - Run  processDropFolder  once and approve the permissions.
 *   - (Optional) run  installTrigger  once to auto-check every few minutes.
 * ---------------------------------------------------------------------------
 */

// ============================ CONFIG — EDIT THIS ONE ============================
const SOURCE_FOLDER_ID   = '1BPPhgd9Wva6G-iZ5TWCby7FnqnoQbznU';   // My Drive > DROP GMAILS HERE
// ===============================================================================

const PROCESSED_SUBFOLDER = 'Processed';   // auto-created inside the folder above
const ARCHIVE_ADDRESS     = 'save@billlayneinsurance.com';   // the copy that gets saved
const ARCHIVE_FIELD       = 'cc';        // 'cc' = client sees it, 'bcc' = hidden from client
const DEFAULT_TO          = '';          // blank = you fill in the recipient before sending
const OWNER_EMAIL         = 'bill@billlayneinsurance.com';   // used only if a blank To is rejected
const SENDER_NAME         = 'Bill Layne Insurance Agency';   // display name on the draft
const DEFAULT_SUBJECT     = 'Bill Layne Insurance Agency';   // used only if no subject is found
const CHECK_EVERY_MINUTES = 5;           // 1, 5, 10, 15, or 30 (used by installTrigger)


/**
 * Main job. Run it by hand, or let installTrigger() run it on a schedule.
 */
function processDropFolder() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log('Another run is already active — skipping this one.');
    return;
  }

  try {
    const source    = DriveApp.getFolderById(SOURCE_FOLDER_ID);
    const processed = getOrCreateProcessed_(source);

    // Snapshot the files first so moving them mid-loop can't confuse the iterator.
    // getFiles() returns only files (not the Processed subfolder), so nothing loops back.
    const it = source.getFiles();
    const files = [];
    while (it.hasNext()) files.push(it.next());

    let made = 0, skipped = 0, failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.getName();

      // Only touch HTML files; leave anything else where it is.
      if (!/\.html?$/i.test(name) && file.getMimeType() !== 'text/html') {
        skipped++;
        continue;
      }

      try {
        const html    = file.getBlob().getDataAsString('UTF-8');
        const subject = extractSubject_(html, name);

        createDraftSafe_(subject, html);

        // Only move AFTER the draft is safely created.
        file.moveTo(processed);
        made++;
        Logger.log('Draft created + filed: "%s"  (subject: "%s")', name, subject);
      } catch (err) {
        failed++;
        // Leave the file in place so the next run retries it.
        Logger.log('FAILED on "%s": %s', name, err.message);
      }
    }

    Logger.log('Done. Drafts made: %s | non-HTML skipped: %s | failed: %s', made, skipped, failed);
    return { made: made, skipped: skipped, failed: failed };
  } finally {
    lock.releaseLock();
  }
}


/** Find (or create once) the "Processed" subfolder inside the drop folder. */
function getOrCreateProcessed_(source) {
  const existing = source.getFoldersByName(PROCESSED_SUBFOLDER);
  return existing.hasNext() ? existing.next() : source.createFolder(PROCESSED_SUBFOLDER);
}


/**
 * Create the Gmail draft. Blank "To" works on most accounts; if yours rejects
 * it, we fall back to your own address as a placeholder you can replace.
 */
function createDraftSafe_(subject, html) {
  const plain = htmlToPlainText_(html);
  const opts  = { htmlBody: html, name: SENDER_NAME };
  opts[ARCHIVE_FIELD] = ARCHIVE_ADDRESS;   // 'cc' or 'bcc' per CONFIG

  try {
    return GmailApp.createDraft(DEFAULT_TO, subject, plain, opts);
  } catch (e) {
    return GmailApp.createDraft(OWNER_EMAIL, subject, plain, opts);
  }
}


/**
 * Subject line priority (first one found wins):
 *   1. <!-- SUBJECT: your subject here -->   (explicit override in the file)
 *   2. <title> ... </title>
 *   3. the file name minus .html (unless it's literally "index")
 *   4. DEFAULT_SUBJECT
 */
function extractSubject_(html, fileName) {
  const comment = html.match(/<!--\s*SUBJECT:\s*([\s\S]*?)-->/i);
  if (comment && comment[1].trim()) return decodeEntities_(comment[1].trim());

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title && title[1].trim()) return decodeEntities_(title[1].trim());

  const base = fileName.replace(/\.html?$/i, '').trim();
  if (base && base.toLowerCase() !== 'index') return base;

  return DEFAULT_SUBJECT;
}


/** Rough plain-text alternative for the draft (Gmail shows the HTML version). */
function htmlToPlainText_(html) {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000);
  return text || 'Please view this email in an HTML-capable mail client.';
}


/** Decode the handful of HTML entities that show up in titles/subjects. */
function decodeEntities_(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}


/** Run ONCE to check the drop folder automatically on a schedule. */
function installTrigger() {
  removeTriggers();   // avoid stacking duplicates
  ScriptApp.newTrigger('processDropFolder')
    .timeBased()
    .everyMinutes(CHECK_EVERY_MINUTES)
    .create();
  Logger.log('Trigger installed: processDropFolder runs every %s minutes.', CHECK_EVERY_MINUTES);
}


/** Run once if you ever want to stop the automatic checking. */
function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processDropFolder') ScriptApp.deleteTrigger(t);
  });
  Logger.log('Any existing processDropFolder triggers removed.');
}
