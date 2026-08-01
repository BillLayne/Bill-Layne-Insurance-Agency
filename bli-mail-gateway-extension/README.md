# BLI Mail Gateway — Chrome Extension

Send Bill Layne Insurance Gmail templates without leaving Chrome. Open a
finished email template in a tab, click the BLI envelope icon, capture the
page, and create a Gmail draft (or send immediately) through the BLI Mail
Gateway.

This is the third client of the shared gateway (see `../mail-gateway/`),
joining the standalone sender page and the per-app `gateway-client.js`
snippet.

## Install (unpacked, ~30 seconds)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Choose the `bli-mail-gateway-extension` folder.
5. Pin **BLI Mail Gateway** from the puzzle-piece Extensions menu.

### One-time setup

1. Click the BLI envelope icon — the side panel opens.
2. Expand **Gateway settings**, paste the gateway `/exec` URL and the
   secret, click **Save**, then **Test connection**. The badge turns green.

### Local file templates (optional)

To capture templates opened straight from disk (`file://` pages):
`chrome://extensions` → BLI Mail Gateway → **Details** → enable
**Allow access to file URLs**. Pages served over `http(s)` (localhost
previews, hosted tools) need nothing extra.

## Daily use

1. Open the finished email template in the active tab.
2. Click the BLI envelope icon — the side panel opens **with the page
   already captured** (the icon click itself carries the capture
   permission). Subject auto-fills from the template's `<title>`.
3. Fill **To** (BCC defaults to Save@BillLayneInsurance.com).
4. **Create Gmail Draft** (recommended — final look in Gmail, then Send
   there) or **Send Now** (immediate, with a confirm step).

The in-panel **Capture** button re-captures the same tab after an icon
click. You can also paste HTML or drop an `.html` file instead.

## Receipts from a payment-confirmation screen

When the captured page is a carrier payment confirmation (not an email
template), don't send it as-is — click **🧾 Receipt from this page**. The
extension reads the payment details off the captured page locally (amount,
date, confirmation #, policy #, method, carrier, name — no AI, nothing
leaves your browser) and opens the **BLI Receipt Builder**
(billlayneinsurance.com/mail-gateway/receipt.html) with those fields
pre-filled. Double-check every field against the screen, then Create Gmail
Draft there — it fills the locked BLI receipt template, BCCs Save@
automatically, and runs the brand integrity checks before it will send.

## Privacy model

- Nothing is read from a page until you click Capture on a tab you invoked
  the extension on (`activeTab` — no blanket site access).
- Nothing leaves the panel except to **your own gateway URL**, and only
  when you click Draft or Send.
- The gateway URL and secret are stored in `chrome.storage.local` on this
  computer only — never in code, never synced, never in the emails.
- No analytics, no history, no background capture.

## Updating

After changing source files: `chrome://extensions` → BLI Mail Gateway →
**Reload**, then reopen the side panel.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Chrome blocked the capture" | Click the BLI toolbar icon on the template tab first, then capture. |
| Capture fails on a `file://` page | Enable **Allow access to file URLs** (see above). |
| Badge says "could not reach URL" | Check the `/exec` URL; the deployment must have access set to **Anyone**. |
| "Unauthorized" | The secret doesn't match the gateway's `GATEWAY_SECRET` script property. |
| Draft/Send buttons disabled | No email HTML loaded yet — capture or paste first. |
