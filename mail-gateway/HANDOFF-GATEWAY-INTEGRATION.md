# HANDOFF — Sending Gmail-Perfect HTML Email From Any BLI App
### (The Mail Gateway pattern: how Mail Studio sends without opening Gmail, and why the HTML never loses its Gmail optimization)

**Audience:** any future Claude session or developer adding "Send / Draft in Gmail" to an existing Bill Layne Insurance app (quote templates, receipt builders, card generators, follow-up tools, etc.).
**Status:** production — verified end-to-end 2026-07-12 (gateway) and 2026-07-16 (Mail Studio direct send).
**Never put the gateway secret or the /exec URL in committed code or inside any email.** They live only in Apps Script script-properties (server side) and browser localStorage (client side).

---

## 1. The big picture — why this works without "going through Gmail"

```
Your web app (any static page)                Google Apps Script            Bill's real Gmail
┌──────────────────────────┐   fetch POST    ┌──────────────────┐          ┌───────────────┐
│ build finished HTML      │  text/plain     │ BLI Mail Gateway │ GmailApp │ Sent folder   │
│ (template + filled vars) ├────────────────►│ doPost(e)        ├─────────►│ + recipient   │
│ Send / Draft button      │  JSON body      │ checks secret    │  .send   │ + BCC Save@   │
└──────────────────────────┘                 └──────────────────┘  .draft  └───────────────┘
```

- The gateway is a **Google Apps Script Web App** deployed as **"Execute as: Me (Bill), access: Anyone."** Every request runs *as Bill's Google account*, so `GmailApp.sendEmail()` sends a real Gmail message: it appears in **Bill's Sent folder**, threads normally, and has full Gmail deliverability (SPF/DKIM of the Workspace domain). No SMTP server, no API keys, no OAuth screens in the client app.
- The client app is **just a static page** (GitHub Pages, Cloudflare Pages, localhost — anywhere). It needs zero backend. It builds the final HTML string and POSTs it.
- Auth is a single shared secret compared inside `doPost` against the `GATEWAY_SECRET` script property. Quota: Workspace tier ≈ **1,500 sends/day** (the response reports `remainingQuota` on every call).

### Source of truth files (this folder)
| File | Role |
|---|---|
| `Code.gs` | The deployed gateway (copy in repo; live copy in Apps Script project "BLI Mail Gateway") |
| `gateway-client.js` | Drop-in `bliMail()` client for any app |
| `index.html` | Universal sender page (paste/drop any finished HTML) + where gateway settings get saved |
| `studio.html` + `studio-templates.js` | Mail Studio — fill-in-the-blanks template builder (the newest, most complete client example) |
| `receipt.html` + `receipt-template.js` | Receipt Builder — single-template client example |
| `DESIGNER-PROMPT.md` | Self-stripping "Draft in Gmail" toolbar pattern for standalone template files |

---

## 2. The gateway API contract (exact)

**Endpoint:** the Apps Script Web App URL ending in `/exec` (get it from Bill / localStorage — never hardcode).
**Method:** `POST` with `Content-Type: text/plain;charset=utf-8` (see §3.1 — this is load-bearing, not a typo).
**Body:** ONE JSON string:

```json
{
  "secret":   "<GATEWAY_SECRET>",
  "mode":     "draft",
  "to":       "customer@example.com",
  "subject":  "your auto quote is ready when you are",
  "html":     "<!DOCTYPE html>… the ENTIRE finished email …</html>",
  "text":     "optional plain-text fallback",
  "cc":       "",
  "bcc":      "Save@BillLayneInsurance.com",
  "replyTo":  "Bill@BillLayneInsurance.com",
  "fromName": "Bill Layne Insurance"
}
```

Rules the gateway enforces (from `Code.gs`):
- `mode`: `"draft"` (default) or `"send"`. `to` is **required for send**, optional for drafts.
- `html` (string) is **required** — it becomes `htmlBody` verbatim, byte-for-byte.
- `text` omitted → the gateway auto-generates a plain-text part by stripping tags (first 800 chars). Always fine to omit.
- **BCC semantics (E&O critical):** omit the `bcc` field entirely → defaults to `Save@BillLayneInsurance.com`. Pass `"bcc": ""` → *no* BCC. Client apps for customer email should either omit it or pass Save@ explicitly. Never silently drop it.
- `fromName` sets the display name only; the address is always Bill's account.

**Response** (always JSON, always HTTP 200 even on logical errors — check `ok`):
```json
{ "ok": true, "mode": "send", "to": "…", "subject": "…", "remainingQuota": 1498 }
{ "ok": true, "mode": "draft", "draftId": "r123…", "to": "…", "remainingQuota": 1498 }
{ "ok": false, "error": "Unauthorized: bad or missing secret." }
```

**Health check:** plain GET to the /exec URL returns `{ ok:true, service:'BLI Mail Gateway', version:'1.0' }`.

**Redeploying the gateway:** Deploy → Manage deployments → pencil → Version: **New version** → Deploy. **Same /exec URL.** (Creating a *new deployment* instead would mint a new URL and break every app — same rule as SendBillDocs.)

---

## 3. Client-side integration — the five gotchas that cost us real debugging time

### 3.1 POST as `text/plain`, never `application/json`
Apps Script web apps **cannot answer a CORS preflight** (`OPTIONS`). `Content-Type: application/json` triggers preflight → the browser blocks the request before it leaves. `text/plain` keeps it a "simple request" — no preflight, works from any origin. The body is still a JSON string; Apps Script parses `e.postData.contents` itself.

```js
fetch(gatewayUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(payload),
  redirect: 'follow'          // Apps Script 302s to a googleusercontent URL — must follow
});
```

### 3.2 `redirect: 'follow'` is required
The /exec endpoint answers with a 302 to `script.googleusercontent.com`. Without follow you get an opaque/failed response.

### 3.3 NEVER use `window.confirm()` / `alert()` / `prompt()` for the send flow
**This is the bug that broke Mail Studio's first live test (2026-07-16).** Chrome silently auto-blocks native dialogs it considers annoying and instantly answers "Cancel" — the user physically cannot send, and nothing looks wrong. Replace with an **in-button two-click confirm**:

```js
// state
let armed = false, armTimer = null;
function disarm() { armed = false; clearTimeout(armTimer);
  sendBtn.classList.remove('armed'); sendBtn.textContent = 'Send Now'; }

// inside the click handler, after validation passes:
if (!armed) {
  armed = true;
  sendBtn.classList.add('armed');                       // orange + pulse CSS
  sendBtn.textContent = '⚠️ Click again to send to ' + to;
  armTimer = setTimeout(disarm, 10000);                 // auto-cancel after 10s
  return;
}
disarm();  // second click: fall through to the actual fetch

// anywhere on the page: editing anything cancels a pending send
document.addEventListener('input', disarm, true);
document.addEventListener('change', disarm, true);
```

### 3.4 Loud feedback — never fail silently
Do **not** disable the send button when validation fails (a disabled button swallows clicks with zero feedback — the user asks "did it send?"). Keep buttons enabled; on click, validate and show a big, bold result banner that `scrollIntoView()`s:
- red `⚠️ NOT SENT — please fill in: First name`
- red `⚠️ NOT SENT — gateway not configured…`
- green `✅ SENT! … on its way to <b>address</b>` **with a link to `https://mail.google.com/mail/u/0/#sent`** as proof, plus the `remainingQuota` count.
Also run validation **before** any gateway-config prompt, and add a fetch timeout (`AbortController`, 45s).

### 3.5 Settings live in localStorage, shared per-origin
Keys (exact): `bliMailGateway.url` and `bliMailGateway.secret`. Every BLI page on `www.billlayneinsurance.com` shares them automatically — configure once on `/mail-gateway/`, and Studio/Receipt/any new page just works. A page on a *different origin* (localhost port, workers.dev, pages.dev) has its own localStorage and needs a one-time entry there. Never hardcode either value in a page, a repo, or an email.

### The drop-in client (`gateway-client.js`)
For an existing app, paste/include `gateway-client.js` and call:

```js
const r = await bliMail({
  mode: 'send',                       // or 'draft'
  to: 'customer@example.com',
  subject: 'your receipt',
  html: finishedEmailHtml             // the FULL document string
});                                   // throws Error with a friendly message on failure
// r.remainingQuota, r.draftId (draft mode)
```

It handles config prompts (once per browser), text/plain, redirect-follow, and error normalization.

---

## 4. Why the HTML never loses its Gmail optimization (the copy-paste problem, solved)

### The old problem
Copy-pasting a rendered `index.html` into Gmail's compose window **destroys the email**: Gmail's paste pipeline strips the entire `<head>` (all `@media` queries → mobile responsiveness dies), rewrites/drops classes, mangles backgrounds, and can inject junk. Every BLI mobile-rendering bug from spring 2026 traced back to this paste path.

### Why the gateway path has no such loss
`GmailApp.sendEmail(..., { htmlBody: html })` hands the **exact string** to Gmail's API as the `text/html` MIME part. Nothing is parsed, stripped, or re-rendered on the way in:
- `<head>` survives → `@media only screen and (max-width:620px){…}` mobile rules **work** in Gmail apps.
- The MSO conditional (`<!--[if mso]>…`) survives for Outlook.
- The preheader div, anti-fit spacer, `<style>` block, schema.org JSON-LD (Gmail rich cards) — all intact.
- The recipient's *client* still applies its normal rendering rules, so the email must still be written Gmail-safe (below) — but nothing is lost in transit.

**Rule: the `html` field must be the complete document** — `<!DOCTYPE html>` through `</html>`. Never send a fragment; never re-serialize it through a DOM (`innerHTML` round-trips can rewrite entities). Build the string, fill the variables, POST the string.

### The HTML itself must still follow the locked BLI Gmail rules
The gateway preserves whatever you give it — so give it correct email HTML (full spec in the `bli-email-2026` skill; gold-standard structure = `receipt-template.js` / `studio-templates.js`):
- Table-based layout, **all critical styles inline** on every element; the `<head>` styles are progressive enhancement only.
- Fluid 600px container on a `#f1f5f9` page; cards with 4px seams; `font-family:'Inter',Arial,'Helvetica Neue',Helvetica,sans-serif` on every text node.
- **Under 102,400 bytes** or Gmail clips the message ("[Message clipped] View entire message") — check `new Blob([html]).size`.
- **No `border-radius:50%`** (ovals on Gmail Android), no agent signature chip, canonical footer verbatim.
- Clean literal `mailto:Save@BillLayneInsurance.com` present.

### The Cloudflare corruption guard (why we grep before every send)
Pages served through Cloudflare can get **email-address obfuscation** injected into stored HTML: `href="/cdn-cgi/l/email-protection#…"`, `__cf_email__` spans, `data-cfemail`. If template HTML was ever saved from a Cloudflare-proxied page, these poison the email (broken mailto links, gibberish). Every client app runs this integrity check **before enabling send**, on every keystroke:

```js
function integrity(html) {
  const problems = [];
  const leftover = html.match(/\{\{[A-Z_]+\}\}/);            // unfilled merge var
  if (leftover) problems.push('unfilled variable ' + leftover[0]);
  ['cdn-cgi', '__cf_email__', 'email-protection',            // Cloudflare corruption
   'XacnUW4',                                                // banned old headshot asset
   'border-radius:50%'                                       // circle → oval on Gmail mobile
  ].forEach(bad => { if (html.includes(bad)) problems.push('forbidden string: ' + bad); });
  if (!html.includes('mailto:Save@BillLayneInsurance.com')) problems.push('Save@ mailto missing');
  if (new Blob([html]).size > 102400) problems.push('over Gmail 102 KB clip limit');
  return problems;   // empty array = safe to send
}
```

Related environment gotcha: in Claude sessions, **never `cat` an HTML email file in bash** (triggers the same obfuscation in some environments) — read files with the Read tool or Python `open().read()`.

---

## 5. The template-fill pattern (how Studio builds HTML that always passes)

Two proven approaches — pick per app:

**A. Locked template string + `{{VARS}}` (Receipt Builder pattern)**
The whole email lives as one JS string (`window.BLI_RECEIPT_TEMPLATE`) with `{{FIRST_NAME}}`-style slots. Fill with split/join (never regex-replace — `$` in values breaks `String.replace`):
```js
Object.keys(vars).forEach(k => { html = html.split('{{' + k + '}}').join(String(vars[k])); });
```

**B. Composed partials (Mail Studio pattern — `studio-templates.js`)**
Shared functions build the shell once (`head()`, `shellOpen()`, `headerCard()`, `heroCard()`, `bodyCard()`, `footerCard()`, `shellClose()`), and each template is `{ id, name, fields[], subject(v), build(v) }` where `build()` concatenates partials with values interpolated. New template ≈ 60 lines instead of 400.

Non-negotiables in both:
1. **HTML-escape every user-entered value** before it enters the string: `&<>"'` → entities. (Studio's `E()` helper.)
2. **Recompute derived fields** from raw input (formatted money, human dates, last-4) — never ask the user to type both.
3. **Auto-build the subject** (lowercase, 30–45 chars) but leave it editable; track a "dirty" flag so user edits stick.
4. Re-run `integrity()` + preview (`iframe.srcdoc = html`, `sandbox=""`) on **every input event**.
5. BCC display in the UI is a **read-only locked field** showing Save@ — visible but untouchable.

---

## 6. Recipes for integrating into an existing app

### Recipe 1 — app already produces finished HTML (quote studios, card pages)
1. Include `gateway-client.js` (or paste its two functions).
2. Add buttons: primary **Send Now** (two-click arm, §3.3) + secondary **Create Gmail Draft**.
3. On click: `integrity()` check → `bliMail({ mode, to, subject, html })` → loud result banner (§3.4).
4. Do NOT add a bcc field to the payload → the Save@ default applies.

### Recipe 2 — standalone template `index.html` files (emailed to Designer, opened from disk)
Use the self-stripping toolbar pattern from `DESIGNER-PROMPT.md`: the template carries a hidden `#bli-send-toolbar` + `#bli-send-script` (display:none). Opened in a browser, the script reveals a "Draft in Gmail" bar, and **before POSTing it deletes both nodes from the DOM copy** so the sent email is byte-identical to the plain template. The sender page (`index.html`) also strips those two IDs on intake, so either path is safe.

### Recipe 3 — hand data from one app to another
Pre-fill via URL fragment (never query string — fragments don't hit servers/logs):
`studio.html#d=<base64url(JSON)>` — see `prefillFromHash()` in `receipt.html`. Used by the Chrome extension → Receipt Builder hand-off.

### Integration checklist (copy into any new app's plan)
- [ ] POST `text/plain;charset=utf-8`, `redirect:'follow'`, 45s AbortController timeout
- [ ] `html` = complete document string, built from a locked BLI template
- [ ] All user input HTML-escaped; derived fields recomputed
- [ ] `integrity()` gate green before send is possible
- [ ] BCC = Save@ (omit the field or pass it explicitly; only `""` if Bill says no record needed)
- [ ] Two-click in-button confirm; **zero native dialogs** in the send path
- [ ] Loud NOT-SENT / big green SENT banner with Sent-folder link + quota
- [ ] Settings from `bliMailGateway.url` / `.secret` localStorage; never hardcoded
- [ ] Subject lowercase 30–45 chars, auto-built, editable

---

## 7. Troubleshooting (everything we've actually hit)

| Symptom | Cause | Fix |
|---|---|---|
| Request blocked before leaving browser (CORS error in console) | `Content-Type: application/json` | Use `text/plain;charset=utf-8` |
| Opaque/failed response, `res.json()` throws | Missing `redirect:'follow'`, or gateway access set to "Anyone with Google account" | Follow redirects; redeploy with access **Anyone** |
| "Cancelled — nothing was sent" / clicks do nothing, user never saw a popup | Chrome auto-blocking `window.confirm()` | Two-click in-button confirm (§3.3) |
| Click does nothing at all, no message | Button was `disabled` by validation | Keep enabled; explain on click (§3.4) |
| `{ ok:false, error:'Unauthorized…' }` | Secret mismatch / rotated | Re-enter secret in localStorage (settings card on `/mail-gateway/`) |
| Email arrives with broken `[email protected]` links | Cloudflare obfuscation baked into stored template | `integrity()` grep for `cdn-cgi` etc.; rebuild template from clean source |
| Mobile rendering broken only when pasted into Gmail compose | Paste strips `<head>` | Don't paste — send through the gateway |
| "[Message clipped]" in Gmail | HTML > 102,400 bytes | Trim; check `new Blob([html]).size` |
| Sent to self but "not in inbox" | It IS in Sent + usually Inbox; self-sends can thread oddly | Check Sent folder first — the success banner links to it |
| Gateway edits don't take effect | Deployed as *new deployment* (new URL) or forgot New version | Manage deployments → pencil → **New version** → same /exec URL |
| `wrangler secret put` style piping of the secret adds a BOM (PowerShell 5.1) | PS pipes prepend BOM | Use Git Bash `printf` when scripting secrets |

---

## 8. Security notes
- The /exec URL alone is not enough to send — the secret is required — but treat the pair like a credential. Rotation = edit the `GATEWAY_SECRET` script property (no redeploy needed) + update localStorage on Bill's browsers.
- The secret never appears in: repo files, page source, emails, URLs. localStorage only.
- Quota (≈1,500/day) is the blast-radius cap if the secret ever leaks; rotate immediately if suspected.
- Every customer send BCCs `Save@BillLayneInsurance.com` — this is the agency's E&O paper trail. Don't build a client that defeats it.
