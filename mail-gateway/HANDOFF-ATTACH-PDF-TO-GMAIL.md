# HANDOFF — Attaching a PDF (or any file) to a Gmail Draft from Any BLI App
### How PDF Studio creates a Gmail draft with the finished PDF already attached — no manual download/attach step

**Audience:** any future Claude session or developer adding "email this file as a Gmail draft" to a Bill Layne Insurance app.
**Status:** production — built and end-to-end verified 2026-08-07 (PDF Studio → real draft in Bill's Gmail with PDF attached).
**Working reference implementation:** `pdf-tools/index.html` in this repo — search for `btnEmailGo` (client) and `mail-gateway/Code.gs` (server, v1.1).
**Read this first if you haven't:** `HANDOFF-GATEWAY-INTEGRATION.md` — the base gateway pattern (CORS, secrets, HTML rules). This doc only adds the attachment layer.

---

## 1. The big picture — this is NOT the Gmail API

No OAuth, no Google Cloud project, no API keys in the client. The mechanism is the existing **BLI Mail Gateway**: a Google Apps Script web app deployed as Bill, so `GmailApp.createDraft()` runs *as Bill's account*. The client app just POSTs JSON.

```
Any BLI web app                       Apps Script (v1.1)               Bill's Gmail
┌─────────────────────────┐  POST     ┌──────────────────┐  GmailApp  ┌────────────┐
│ produce file bytes      │ text/plain│ BLI Mail Gateway │ .createDraft│ Drafts     │
│ (Uint8Array)            ├──────────►│ doPost(e)        ├───────────►│ + file     │
│ base64-encode           │ JSON body │ base64 → Blob    │  w/ blob   │ attached   │
│ add to payload          │           │ → attachments[]  │            │            │
└─────────────────────────┘           └──────────────────┘            └────────────┘
```

The file never touches any server except Google's own Apps Script → Gmail hop. The draft appears in **Bill's Drafts folder**; he reviews and hits Send inside Gmail (drafts-only is the deliberate safety design — nothing auto-sends).

## 2. Server prerequisite — gateway must be v1.1+

The original gateway (v1.0) had **no attachment support and silently ignored unknown fields** — a v1.0 gateway creates the draft *without* the file and reports success. That's why the client MUST check the `attached` field (see §4).

- Version check: plain GET to the /exec URL → `{"ok":true,"service":"BLI Mail Gateway","version":"1.1"}`.
- **v1.1 is already deployed** (redeployed 2026-08-07, Version 2, same /exec URL as always).
- The v1.1 server change, in `Code.gs` (repo copy is current):

```js
// v1.1: optional file attachments (base64) — e.g. PDFs from PDF Studio
let attached = 0;
if (Array.isArray(req.attachments) && req.attachments.length) {
  try {
    options.attachments = req.attachments.slice(0, 5).map(function (a) {
      return Utilities.newBlob(
        Utilities.base64Decode(String(a.dataB64 || '')),
        String(a.mimeType || 'application/octet-stream'),
        String(a.name || 'attachment')
      );
    });
    attached = options.attachments.length;
  } catch (attErr) {
    return respond_({ ok: false, error: 'Bad attachment data: ' + attErr });
  }
}
// …and every success response now includes  attached: attached
```

- If the gateway ever needs redeploying: Apps Script project "BLI Mail Gateway" → paste Code.gs → Deploy → **Manage deployments → pencil → Version: New version → Deploy**. NEVER "New deployment" (mints a new URL, breaks every app).
- Automation note: the Apps Script editor is Monaco in an iframe — set code via `win.monaco.editor.getModels()[0].setValue(...)` found by walking `window.frames`. script.google.com may open on the wrong Google account; fix with `?authuser=bill%40billlayneinsurance.com`.

## 3. The request contract (v1.1)

POST to the /exec URL, `Content-Type: text/plain;charset=utf-8` (NEVER application/json — Apps Script can't answer CORS preflight), body = one JSON string:

```json
{
  "secret":  "<from localStorage bliMailGateway.secret>",
  "mode":    "draft",
  "to":      "customer@example.com",
  "subject": "your documents",
  "html":    "<!DOCTYPE html><html><body><p>…short note…</p></body></html>",
  "attachments": [
    { "name": "policy-packet.pdf", "mimeType": "application/pdf", "dataB64": "<base64 of the bytes>" }
  ]
}
```

Rules:
- `attachments` is optional, **max 5**, each `{name, mimeType, dataB64}`. Any file type works (`application/pdf`, `image/jpeg`, …).
- **Omit `bcc` entirely** → gateway defaults to `Save@BillLayneInsurance.com` (the agency E&O record copy). Never defeat this for customer mail.
- `to` is optional for drafts (Bill can add it in Gmail); required for `mode:"send"`.
- Success response: `{ ok:true, mode:"draft", draftId:"…", attached:1, remainingQuota:1497 }`.

## 4. Client recipe (copy-paste)

```js
// 1) base64 a Uint8Array — MUST chunk; String.fromCharCode.apply on a full
//    multi-MB array blows the call stack
function b64FromBytes(u8) {
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return btoa(s);
}

async function draftWithAttachment(bytes, filename, to, subject, noteText) {
  // 2) settings live per-origin in localStorage — never hardcode either value
  const url = localStorage.getItem('bliMailGateway.url');
  const secret = localStorage.getItem('bliMailGateway.secret');
  if (!url || !secret) throw new Error('Gateway not configured in this browser — set it up on /mail-gateway/ once.');

  // 3) size guard — Gmail attachment ceiling is 25 MB; stay under 20
  if (bytes.length > 20 * 1048576) throw new Error('File too large to email (' + Math.round(bytes.length / 1048576) + ' MB).');

  // 4) minimal Gmail-safe note; entity-escape non-ASCII (GmailApp corrupts
  //    astral/emoji chars — see base handoff §3.5); strip astral from subject
  const noteHtml = '<!DOCTYPE html><html><body><p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1e293b;line-height:1.6">'
    + noteText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
    + '</p></body></html>';
  const safeHtml = noteHtml.replace(/[^\x00-\x7F]/gu, ch => '&#x' + ch.codePointAt(0).toString(16).toUpperCase() + ';');
  const safeSubject = subject.replace(/[\u{10000}-\u{10FFFF}]/gu, '').replace(/ {2,}/g, ' ').trim() || 'document attached';

  // 5) POST — text/plain + redirect follow + timeout are ALL load-bearing
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      secret, mode: 'draft', to: to || '', subject: safeSubject, html: safeHtml,
      attachments: [{ name: filename, mimeType: 'application/pdf', dataB64: b64FromBytes(bytes) }]
      // bcc omitted on purpose → Save@ default
    }),
    redirect: 'follow',
    signal: ctrl.signal
  });
  clearTimeout(timer);
  const out = await res.json();

  // 6) THE ATTACHMENT CHECK — a v1.0 gateway "succeeds" without attaching
  if (!out.ok) throw new Error(out.error || 'gateway error');
  if (out.attached !== 1) throw new Error('Draft created but the file was NOT attached — the Mail Gateway needs its v1.1 update.');
  return out;   // { draftId, remainingQuota, … }
}
```

UI rules that still apply (from the base handoff — they broke real sends before):
- **NEVER `window.confirm/alert/prompt`** anywhere near the send path (Chrome silently auto-cancels them). Drafts don't need confirmation at all; actual `mode:"send"` needs the two-click in-button arm pattern.
- **Loud banners, never disabled buttons**: green success banner with a link to `https://mail.google.com/mail/u/0/#drafts` (or `#sent`), red NOT-CREATED banner with the reason.

## 5. Getting the gateway settings onto a new device/origin

- Same origin (`www.billlayneinsurance.com` pages): already configured — shared localStorage, nothing to do.
- Different origin (pages.dev, workers.dev, localhost): one-time manual entry, or copy PDF Studio's **QR hand-off**: encode `{u:url, s:secret}` as base64url in a **URL fragment** (`/yourapp/#gw=…`), show it as a QR (qrcodejs from cdnjs); on arrival the app saves both keys to localStorage, then `history.replaceState` to strip the secret from the address bar, plus a `hashchange` listener (a hash-only navigation does NOT reload the page). Fragments never reach any server. Wipe the QR from the DOM on close. See `connectFromHash()` in `pdf-tools/index.html`.

## 6. Gotchas index (each cost real debugging time)

| # | Gotcha | Rule |
|---|---|---|
| 1 | CORS preflight | POST as `text/plain;charset=utf-8`, never `application/json` |
| 2 | Apps Script 302s | `redirect: 'follow'` or the response is opaque |
| 3 | v1.0 gateway ignores `attachments` silently | always check `out.attached === 1` |
| 4 | `String.fromCharCode.apply` stack overflow on big files | chunked base64 (0x8000) |
| 5 | Gmail attachment limit | 25 MB hard; guard at 20 MB; offer compression first |
| 6 | Emoji → `������` in Gmail | entity-escape html non-ASCII; strip astral from subject |
| 7 | Native dialogs auto-blocked by Chrome | in-page banners/two-click arm only |
| 8 | Secret hygiene | localStorage only — never in repo, page source, or emails; URL *fragments* are OK for device hand-off |
| 9 | BCC semantics | omit field = Save@ record copy; empty string kills it — don't |
| 10 | Redeploy rule | Manage deployments → pencil → New version → SAME /exec URL |

## 7. Where this is already wired

- **PDF Studio** (`pdf-tools/index.html`) — "✉ Gmail draft" button: builds the tray PDF (optionally shrunk/page-numbered/locked), attaches, drafts. The complete, battle-tested example to copy.
- **CertGuard AI** (`Playground\coi-certificates-certguard-ai-sprint-2026-04-28-081935`, live at coi-certificates-certguard-ai.pages.dev) — "Gmail Draft + Attach PDF" (2026-08-11): certificate PDF attached AND a fully styled 600px email body in the same draft. For the styled-body layer, see `HANDOFF-STYLED-DRAFT-BODY.md`.
- Candidates Bill has mentioned for the same treatment: quote studios, receipt builder, letterhead generator — any app that produces a file the customer should receive.
