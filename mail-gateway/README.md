# BLI Mail Gateway

One shared endpoint that lets **any** Bill Layne Insurance tool create a Gmail
draft or send an email directly from the program — no more copy-pasting HTML
into a Gmail compose window.

Bonus: emails sent through the gateway render **better** than pasted ones.
Pasting into Gmail strips the `<head>` styles and media queries; the gateway
delivers the raw HTML intact, so mobile-first templates keep their stacking
rules.

## What's in this folder

| File | What it is |
|---|---|
| `Code.gs` | The Apps Script gateway (v1.1, attachments) — paste into script.google.com (one time) |
| `index.html` | Universal sender page — paste/drop any template, preview, Draft or Send |
| `gateway-client.js` | Drop-in snippet to add a "Draft in Gmail" button to any BLI app |
| `README.md` | This file |

## Integrating the gateway into a NEW app — read these in order

| Read | To add |
|---|---|
| 1. `HANDOFF-GATEWAY-INTEGRATION.md` | The base: send/draft any HTML email from any app (CORS rules, secrets, escaping, UI rules) |
| 2. `HANDOFF-ATTACH-PDF-TO-GMAIL.md` | **Attach a PDF (or any file) to the draft automatically** — v1.1 contract, base64 recipe, `attached===1` check |
| 3. `HANDOFF-STYLED-DRAFT-BODY.md` | **Put a fully styled branded email body in the draft** — template + `{{TOKENS}}` + conditional blocks pipeline |

Working reference implementations: **PDF Studio** (`/pdf-tools/index.html` — all three layers,
search `btnEmailGo`) and **CertGuard AI** (styled COI email + ACORD PDF). A future Claude
prompt as simple as *"add a Gmail-draft button like PDF Studio's — read the three handoffs
in mail-gateway/"* is enough to wire everything correctly.

## One-time deploy (about 3 minutes)

> Do this while logged in as **Bill@billlayneinsurance.com** — the deploying
> account is the account the emails come from.

1. Go to **script.google.com** → **New project**. Name it `BLI Mail Gateway`.
2. Delete the starter code, paste the entire contents of `Code.gs`, and Save.
3. Click the **gear icon (Project Settings)** → **Script properties** →
   **Add script property**:
   - Property: `GATEWAY_SECRET`
   - Value: your secret (long and random — do NOT reuse the granite-* codes)
4. Back in the editor, pick **`selfTest`** in the function dropdown → **Run**.
   Authorize when prompted (Advanced → *Go to BLI Mail Gateway (unsafe)* →
   Allow — it's your own script, this is normal). Then check Gmail → Drafts
   for the self-test draft.
5. **Deploy → New deployment** → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**  ← must be *Anyone*, NOT "Anyone with Google account"
6. Copy the **Web app URL** (ends in `/exec`).
7. Open `index.html` (double-click the file, or host it), expand **Gateway
   settings**, paste the URL + secret, **Save settings**, then **Test
   connection** — the header badge should turn green.

### Updating the gateway later

Same rule as SendBillDocs: edit the code, then **Deploy → Manage deployments →
pencil icon → Version: New version → Deploy**. The `/exec` URL stays the same.
(A plain code save does NOT go live.)

## Using the sender page

1. Drag-drop the template's `index.html` (or paste the HTML).
2. Subject auto-fills from the template's `<title>`. Fill in To.
3. BCC defaults to `Save@BillLayneInsurance.com` — clear the field to skip it.
4. **Create Gmail Draft** (recommended for customer emails — final look in
   Gmail, then hit Send there) or **Send Now** (goes out immediately; good for
   receipts).

The page works opened straight from this folder (`file://`) or hosted. If this
repo is pushed, it will be live at `billlayneinsurance.com/mail-gateway/` —
that's safe (the page contains no secret), but it's a staff tool, so keeping
it local is fine too.

## Wiring a "Draft in Gmail" button into another app

Paste the contents of `gateway-client.js` into the app, then:

```html
<button onclick="draftInGmail()">Draft in Gmail</button>
<script>
async function draftInGmail() {
  try {
    await bliMail({
      mode: 'draft',              // or 'send'
      to: '',                     // optional for drafts
      subject: document.title,
      html: getEmailHtml()        // app-specific: the finished email HTML string
    });
    alert('Draft created ✓  Open Gmail › Drafts');
  } catch (e) { alert(e.message); }
}
</script>
```

First click in each app prompts once for the gateway URL + secret and stores
them in that app's localStorage.

## API reference

`POST` to the `/exec` URL. Body = JSON **string**, sent with
`Content-Type: text/plain` (this avoids the CORS preflight, which Apps Script
can't answer — never use `application/json`).

| Field | Required | Notes |
|---|---|---|
| `secret` | yes | Must match the `GATEWAY_SECRET` script property |
| `mode` | no | `draft` (default) or `send` |
| `to` | send: yes / draft: no | Comma-separate multiple addresses |
| `subject` | no | Defaults to `(no subject)` |
| `html` | yes | The full email HTML |
| `text` | no | Plain-text part; auto-generated from the HTML if omitted |
| `cc` | no | |
| `bcc` | no | Omit the field → defaults to `Save@BillLayneInsurance.com`; send `""` → no BCC |
| `replyTo` | no | |
| `fromName` | no | Display name; defaults to `Bill Layne Insurance` |

Success: `{ ok:true, mode, draftId?, to, subject, remainingQuota }`
Failure: `{ ok:false, error }`

## Security notes

- The secret lives in **Script Properties** (server side) and in the staff
  browser's **localStorage** — never hardcode it in any page you ship, and
  never in the email HTML itself.
- Anyone with the URL but no secret gets `Unauthorized` and can do nothing.
- If the secret ever leaks: change the `GATEWAY_SECRET` script property.
  Done — old secret is dead everywhere, no redeploy needed.

## Limits & gotchas

- **Daily quota:** Google Workspace ≈ 1,500 recipients/day via Apps Script
  (consumer Gmail is only 100/day). Every gateway response includes
  `remainingQuota` so you can see where you stand.
- **Gmail clipping:** Gmail clips messages over ~102 KB of HTML — the sender
  page warns you at 100 KB. (Same rule as always for BLI templates.)
- **CORS errors in the console:** almost always means the deployment's "Who
  has access" is not **Anyone**, or the client sent `application/json`.
- **Sent mail lands in your Gmail Sent folder** and threads normally — same
  as sending by hand.
