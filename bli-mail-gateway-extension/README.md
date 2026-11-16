# BLI Mail Gateway — Chrome Extension (v1.2.0)

Send Bill Layne Insurance Gmail templates without leaving Chrome. Open a
finished email template in a tab, click the BLI envelope icon, optionally attach
PDF declarations/quotes, and create a Gmail draft (or send immediately) through
the BLI Mail Gateway.

## What's new in v1.2.0

- **Auto-Cleans Captured Templates:** Strips `#bli-send-toolbar`, `#preview-toolbar`, browser extension overlays (Grammarly), and executable `<script>` tags while preserving Schema.org JSON-LD Rich Cards.
- **600px Spacer & Emoji Protection:** Swaps base64 600px anti-fit spacers to the hosted BLI CDN PNG and entity-encodes non-ASCII characters so emojis never corrupt in `GmailApp`.
- **Attach PDFs Directly in the Side Panel:** Drop or choose up to 5 PDFs (`18 MB` total) with individual `×` remove buttons.
- **Pre-Flight QA Pills:** Instantly flags unfilled `{{TOKENS}}`, Cloudflare `cdn-cgi` link obfuscation, and `>102 KB` Gmail clipping.
- **Zero Native Popups:** Replaces Chrome-blocked `window.confirm()` dialogs with a 10-second orange pulsing two-click arming button, plus 1-click deep-linking straight to the created Gmail draft.

## Install / Update (`chrome://extensions`)

1. Open `chrome://extensions` in Chrome and ensure **Developer mode** is on.
2. First install: **Load unpacked** → choose `bli-mail-gateway-extension`.  
   Updating from v1.1.x: click **Reload** (`↻`) on the **BLI Mail Gateway** card, then reopen the side panel.
3. For local disk templates (`file://`): click **Details** → enable **Allow access to file URLs**.
