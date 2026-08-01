# BLI Draft Dropper

A no-AI fallback for your Claude Design email templates.

**Drop an HTML file in a Drive folder → a Gmail draft appears (archive copy included) → the file is filed into a `Processed` subfolder.**

No Claude, no MCP, no browser automation. Just a small Google Apps Script bound to your account that runs on a timer.

> **STATUS: LIVE (set up 2026-07-23).** The folder, script, authorization, and 5-minute trigger are all in place and were verified end-to-end. This README is now a reference for how it works and how to maintain it — you don't need to set anything up again.

---

## How the flow works

```
You export index.html from Claude Design
        │
        ▼
Drop it in:  My Drive ▸ DROP GMAILS HERE      ← the drop folder
        │
        ▼  (script runs every 5 min)
Gmail DRAFT created  —  HTML body, CC save@billlayneinsurance.com, To left blank
        │
        ▼
File moved to:  DROP GMAILS HERE ▸ Processed  ← nothing deleted, never re-processed
```

The **To** field is left blank on purpose — you open the draft, add the client, and hit Send. The archive copy to `save@` rides along automatically.

**Why My Drive and not the BLI Clients shared drive?** That shared drive has a daily cleaner that empties `_DROP DOCUMENTS HERE`. This whole program lives in My Drive, completely out of its reach — it never touches `_DROP DOCUMENTS HERE`.

---

## The live setup (for reference)

| Piece | Where |
|---|---|
| Drop folder | **My Drive ▸ DROP GMAILS HERE** — `1BPPhgd9Wva6G-iZ5TWCby7FnqnoQbznU` |
| Archive subfolder | **DROP GMAILS HERE ▸ Processed** (auto-created by the script) |
| Apps Script project | **BLI Draft Dropper** at [script.google.com](https://script.google.com) |
| Schedule | time trigger, every **5 minutes** |
| Archive copy | **CC** `save@billlayneinsurance.com` |

---

## Daily use

1. Build the email in Claude Design, export `index.html`.
2. Rename it to the client/topic — e.g. `smith-auto-renewal.html` (Windows won't allow two files named `index.html` in the same folder anyway).
3. Drop it in **DROP GMAILS HERE** (it's under your Google Drive for Desktop *My Drive* on the PC).
4. Within ~5 minutes: the draft is waiting in Gmail, the file is filed in **Processed**. Open the draft, add the recipient, send.

To run it immediately instead of waiting for the timer: open the script and click **Run** on `processDropFolder`.

---

## Controlling the subject line

The script picks the subject in this order (first match wins):

1. **An explicit tag in the file** — put this anywhere in the HTML:
   ```html
   <!-- SUBJECT: Your Auto Renewal is Ready, John -->
   ```
2. The `<title>...</title>` of the HTML.
3. The **file name** (minus `.html`) — so `smith-auto-renewal.html` → subject `smith-auto-renewal`.
4. Falls back to `Bill Layne Insurance Agency`.

The `<!-- SUBJECT: -->` tag is the easiest to control per email.

---

## Options you can flip in CONFIG (top of `Code.gs`)

| Setting | Default | Change it to… |
|---|---|---|
| `ARCHIVE_FIELD` | `'cc'` | `'bcc'` to hide the `save@` copy from the client |
| `ARCHIVE_ADDRESS` | `save@billlayneinsurance.com` | any archive inbox |
| `DEFAULT_TO` | `''` (blank) | a fixed recipient if you ever want one |
| `SENDER_NAME` | `Bill Layne Insurance Agency` | your display name |
| `PROCESSED_SUBFOLDER` | `'Processed'` | a different archive-folder name |
| `CHECK_EVERY_MINUTES` | `5` | `1`, `10`, `15`, or `30`, then re-run `installTrigger` |

After changing `CHECK_EVERY_MINUTES`, run **`installTrigger`** once to apply the new schedule. To stop the automation entirely, run **`removeTriggers`**.

---

## Good to know / troubleshooting

- **Images must be hosted (absolute `https://` URLs).** Your Claude Design "built for Gmail" templates already self-host from `billlayneinsurance.com/email-assets/…`, so they render fine. Local/relative image paths would break in email.
- **Nothing happened?** Give Drive for Desktop a minute to sync the file up before the script sees it. Then check **Executions** in the script editor (left sidebar, clock icon) — it logs every file processed, skipped, or failed.
- **A file failed?** It stays in the drop folder and is retried on the next run, so nothing is lost.
- **Only HTML is touched.** Any non-HTML file dropped in is ignored and left alone.
- **It never sends and never deletes.** It only creates drafts and *moves* files into `Processed`.

---

## Files

- `Code.gs` — the whole program (this is what's pasted into the live project).
- `appsscript.json` — reference manifest.
