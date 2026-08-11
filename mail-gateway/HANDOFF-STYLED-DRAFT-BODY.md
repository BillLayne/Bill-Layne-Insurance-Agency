# HANDOFF — Putting a Fully STYLED Email Body in a Gmail Draft (not just a text note)
### How CertGuard AI delivers its 600px card-based certificate email into Gmail drafts with every container, color, and mobile rule intact — and how to do the same in PDF Studio or any BLI app

**Audience:** any future Claude/Codex session upgrading a BLI app (PDF Studio first) from a plain-text draft note to a full styled email body.
**Status:** production — CertGuard AI drafts have shipped this way since 2026-08-11 (commit `769181e` in the CertGuard repo).
**Working reference implementation:** the CertGuard AI repo (`Playground\coi-certificates-certguard-ai-sprint-2026-04-28-081935`) — template at `public/assets/certificate-of-insurance-template.html`, fill logic in `renderPreview()` in `src/lib/coi.ts`, send path in `src/lib/mailGateway.ts`.
**Read these first:** `HANDOFF-GATEWAY-INTEGRATION.md` (base gateway) and `HANDOFF-ATTACH-PDF-TO-GMAIL.md` (attachments). This doc only covers the styled-body layer.

---

## 1. The big picture — the styled email is DELIVERED, not pasted

There are two completely different ways a styled email gets into Gmail, and they must not be confused:

| Path | How it works | Fidelity |
|---|---|---|
| **Clipboard paste** ("copy styled email" → click Gmail body → Ctrl+V) | Gmail's compose box *re-interprets* the HTML on paste | Lossy. Gmail strips/rewrites as it pastes; needs hacks like viewport stabilizer divs; breaks differently on desktop vs mobile |
| **Gateway `html` field** (what CertGuard does) | The HTML string is stored by Gmail as the message's actual `text/html` MIME part | Lossless. What you POST is what the draft IS |

The mechanism is one line in the gateway (`mail-gateway/Code.gs`):

```js
const options = {
  htmlBody: html,          // <- req.html, passed through VERBATIM
  name: String(req.fromName || DEFAULT_FROM_NAME)
};
// ...
const draft = GmailApp.createDraft(to, subject, text, options);
```

The gateway does **zero** sanitization or rewriting of `req.html`. PDF Studio already uses this exact field — it just sends a bare `<p>` note (built at `noteHtml` near the `btnEmailGo` handler in `pdf-tools/index.html`). CertGuard sends a complete 600px card-based email document through the *same field of the same POST*. That is the entire difference. **No new gateway work is needed — v1.1 already supports this.**

Bonus field: the gateway also accepts an optional `text` property (plain-text fallback part). If omitted it auto-derives one from the HTML (`textFallback_`). Send it explicitly only if you want to control what text-only clients see.

## 2. Why the containers survive — construction rules, not delivery tricks

Delivery being lossless only helps if the HTML itself is email-proof. Gmail (and Outlook/Apple Mail on the receiving end) still ignore or strip modern CSS. CertGuard's template survives because it is built like a 2005 web page, on purpose. These are the load-bearing rules, all visible in `certificate-of-insurance-template.html`:

1. **Tables, never divs, for layout.** Every card, row, and column is a `<table role="presentation" cellpadding="0" cellspacing="0" border="0">`. Divs are only used for non-structural wrappers.
2. **One 600px shell, declared twice.** Outer 100% table centers an inner `<table class="container" width="600" style="width:600px;max-width:600px;margin:0 auto;">`. The HTML `width="600"` attribute is for old renderers; the inline `max-width` makes it shrink on phones. Both, always.
3. **Every style that matters is INLINE on its element.** The `<style>` block in `<head>` holds ONLY progressive enhancements (mobile `@media` overrides like `.container{width:100%!important}`, `.stack-mobile`, `.fluid-img`). Some clients strip `<head>` entirely — the email must still look right with the style block gone.
4. **Spacing = padded `<td>`s and dedicated gap rows.** Cards are separated by `<tr><td style="height:16px;font-size:0;line-height:16px;mso-line-height-rule:exactly;">&nbsp;</td></tr>` — never CSS `margin` between tables (Outlook eats it).
5. **Backgrounds declared twice:** `bgcolor="#003f87"` attribute AND `style="background-color:#003f87"` on the same `<td>`/`<table>`.
6. **Cards are one table each** with `border-radius` + `border` + `overflow:hidden` inline. Rounded corners degrade gracefully where unsupported (Outlook shows square — acceptable).
7. **Images:** absolute HTTPS URLs, explicit `width="600"` attribute, `style="display:block;width:600px;max-width:100%;height:auto;"`, meaningful `alt`, and the containing `<td>` gets `font-size:0;line-height:0` so no phantom gap appears under the image.
8. **Image-blocked fallback strip:** the first visible row of the hero card is a plain text bar ("Certificate of Insurance attached") so the email communicates even with images off.
9. **Fonts:** `font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` inline on every text element. Never `@import` or `<link>` fonts (Gmail strips them — long-standing BLI rule).
10. **Head hygiene:** `<meta name="x-apple-disable-message-reformatting">`, `color-scheme: light only` metas, MSO `OfficeDocumentSettings` conditional, and `mso-line-height-rule:exactly` on spacer rows. Cheap insurance for Apple Mail / Outlook recipients.

> **Stabilizer note:** CertGuard's template still carries a hidden "600px viewport stabilizer" Courier div at the top of `<body>`. That is a **clipboard-paste-path artifact** (it stops Gmail desktop from shrinking a pasted email). It is invisible and harmless via the gateway, but per Bill's current BLI email standards, **do not add a stabilizer to new gateway-delivered emails** — the gateway path doesn't need it. Card tables + gap rows only.

## 3. The template + token pipeline (how CertGuard fills it)

The styled email is a **standalone template asset with `{{TOKENS}}`**, not markup built in JS string concatenation. That keeps design iteration (an email lab page, A/B passes) separate from app logic.

```
public/assets/certificate-of-insurance-template.html   <- full email doc with {{TOKENS}}
                    |  fetch(templatePath, { cache: "no-store" })
                    v
   replaceAll("{{INSURED_COMPANY}}", value)  for ~40 tokens
                    v
   applyConditionalBlock(html, "AUTO", hasAuto)   <- strip/keep optional sections
                    v
   generated.emailHtml    <- stored; SAME string feeds preview overlay AND the draft
```

Optional sections use **HTML comment markers**, so the template stays valid and previewable in a browser:

```html
<!-- {{IF_AUTO_START}} -->
<tr> ... the whole Auto Liability row ... </tr>
<!-- {{IF_AUTO_END}} -->
```

```js
function applyConditionalBlock(html, marker, enabled) {
  const pattern = new RegExp(
    `<!-- \\{\\{IF_${marker}_START\\}\\} -->[\\s\\S]*?<!-- \\{\\{IF_${marker}_END\\}\\} -->`, "g");
  return html.replace(pattern, (block) => {
    const inner = block
      .replace(new RegExp(`<!-- \\{\\{IF_${marker}_START\\}\\} -->`, "g"), "")
      .replace(new RegExp(`<!-- \\{\\{IF_${marker}_END\\}\\} -->`, "g"), "");
    return enabled ? inner : "";
  });
}
```

Rules that earn their keep:

- **`cache: "no-store"` on the template fetch** — otherwise template edits ship but browsers keep serving the old email for days.
- **The exact same filled string** powers the on-screen "Preview Email" overlay and the gateway draft. One source of truth; the preview is honest.
- Tokens that may be empty get conditional blocks, not blank cells — an empty `<td>` row still renders as a gap.

## 4. The send path — two escapes, then the normal POST

From CertGuard's `src/lib/mailGateway.ts` (this is the ONLY processing between the filled template and the wire):

```js
// GmailApp corrupts astral/emoji characters -> entity-escape EVERYTHING non-ASCII in the body
function escapeNonAsciiHtml(html) {
  return html.replace(/[^\x00-\x7F]/gu,
    (ch) => "&#x" + ch.codePointAt(0).toString(16).toUpperCase() + ";");
}

// Subjects can't use entities -> strip astral chars entirely, collapse doubled spaces
function safeSubjectText(subject) {
  return subject.replace(/[\u{10000}-\u{10FFFF}]/gu, "").replace(/ {2,}/g, " ").trim()
    || "certificate attached";
}
```

Then the standard v1.1 POST (`text/plain;charset=utf-8`, `redirect:"follow"`, 45s abort — all rules in the base handoffs):

```json
{
  "secret": "…", "mode": "draft",
  "to": "customer@example.com",
  "cc": "optional@example.com",
  "subject": "Certificate of Insurance - Acme LLC - Holder Name",
  "html": "<!DOCTYPE html><html>… the ENTIRE filled styled email …</html>",
  "attachments": [{ "name": "acme-coi.pdf", "mimeType": "application/pdf", "dataB64": "…" }]
}
```

Notes:

- POST the **whole document** — doctype, `<head>`, `<style>`, everything. GmailApp handles it; recipients' clients take what they support, and the inline styles carry the rest.
- The per-character escape is safe to run on the full document (ASCII markup passes through untouched; `&mdash;`-style entities already in the template are ASCII and unaffected). Run it **once** — double-escaping turns `&#x2014;` into visible text.
- Emoji in the template should already be entities (`&#128196;`), but the escape pass makes stray pasted emoji safe too.
- Keep the `out.attached === 1` check and the banner rules from the attachment handoff.

## 5. What to change in PDF Studio, specifically

Everything in `pdf-tools/index.html` stays — settings keys, `b64FromBytes`, POST shape, `attached` check, banners, QR hand-off. The only change is what goes into `html`:

1. **Build a PDF Studio email template** following §2's rules: hero/fallback-strip card, a "your documents" card (file name(s), page count, optional note Bill types), and the standard BLI footer. Brand: navy `#003f87`, gold accents, `system-ui` stack — match the agency's locked email standards, and pull shared imagery from `https://img.billlayneinsurance.com` (**never add new imgur URLs in this repo** — standing rule since the 2026-08 migration).
2. **Where the template lives — two workable options:**
   - **Inline `<template id="emailTpl">` block** in `pdf-tools/index.html` (recommended): PDF Studio is deliberately a single self-contained file; an inline template keeps it that way and needs no extra fetch. Read with `document.getElementById('emailTpl').innerHTML`.
   - Separate asset (`/pdf-tools/email-template.html`) fetched with `cache:'no-store'`: better if the template will be shared with other apps or iterated in an email lab. Costs one request and a failure path.
3. **Fill tokens** with `replaceAll` (escape user-typed values for `&<>` first — CertGuard's tokens come from structured data, but PDF Studio's note is free-typed) and keep the existing per-character non-ASCII escape as the last step before POST. Delete the old `noteHtml` paragraph builder.
4. **Preview honestly:** if PDF Studio grows a preview, render the same filled string in an `<iframe srcdoc>` — not a re-implementation.
5. Subject stays astral-stripped; `text` field optional.

## 6. Verify (10 minutes, catches 95%)

1. Create a draft with a real PDF through the app.
2. Gmail **desktop**: open the draft. Cards separated and rounded, one centered 600px column, no giant gaps, hero image full-bleed in its card, no `������` characters.
3. Gmail **mobile app**: same draft. Single column, full width, text legible without zoom (the `@media` overrides working = template intact end to end).
4. Settings → Images → "Ask before displaying" (or block images): fallback strip must carry the message.
5. **Send it to yourself** and re-check received rendering — compose view and received view differ slightly; received is the truth.
6. Confirm the response reported `attached: 1` and the banner linked to Drafts.

## 7. Gotchas index

| # | Gotcha | Rule |
|---|---|---|
| 1 | "Styled" was assumed to need clipboard paste | It doesn't. `html` field → `htmlBody` → the draft IS the styled email |
| 2 | `<style>`-block-only styling collapses in some clients | Inline every load-bearing style; `<style>` = mobile enhancements only |
| 3 | CSS margins between cards vanish (Outlook) | Gap spacer rows: `height:16px;font-size:0;line-height:16px;mso-line-height-rule:exactly` |
| 4 | Email shrinks or stretches on phones | `width="600"` attribute AND `max-width:600px` inline, plus `.container{width:100%!important}` in `@media` |
| 5 | Emoji/astral → `������` after GmailApp | Entity-escape non-ASCII in body (once!); strip astral from subject |
| 6 | Double-escaping shows literal `&#x2014;` text | The escape pass runs exactly once, as the final step |
| 7 | Phantom gaps under images | `display:block` on `<img>`, `font-size:0;line-height:0` on its `<td>` |
| 8 | Images blocked = blank email | Text fallback strip as the first visible row |
| 9 | Template edits don't show up | `cache:"no-store"` on the template fetch |
| 10 | Stabilizer div cargo-culted into new emails | Paste-path relic. Gateway emails don't need it — omit in new templates |
| 11 | Free-typed user text breaks markup | Escape `&<>` (and newlines→`<br>`) before token insertion |
| 12 | New imgur URLs | Banned in this repo — self-host on `img.billlayneinsurance.com` |

## 8. Where this already works

- **CertGuard AI** (`coi-certificates-certguard-ai.pages.dev`) — "Gmail Draft + Attach PDF": full styled certificate email + ACORD PDF in one draft. The pattern this doc describes.
- **PDF Studio** (`/pdf-tools/`) — DONE 2026-08-12: Bill's "Gold Elite Document Delivery" template embedded as `<script type="text/plain" id="emailTpl">` (inert full-document storage — do NOT use `<template>`, the parser strips `<html>/<head>/<body>` inside it). Tokens filled per this doc; a "What is this email delivering?" dropdown swaps HEADLINE/INTRO_LINE/subject per document type (one template, five voices); IF_NOTE follows the note box, IF_LOCKED follows the lock-with-password checkbox.
- Same recipe applies to any future BLI app that owns a styled template: quote studios, receipt builder, letterhead generator.
