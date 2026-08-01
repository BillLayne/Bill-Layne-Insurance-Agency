# Bill Layne Insurance Assistant for Chrome

A local-first Chrome side-panel extension for preparing insurance information for ChatGPT or Codex without an OpenAI API key.

## What it does

- Captures visible text, headings, tables, and non-password form fields from the active webpage only after you click **Capture page**.
- Captures highlighted text when you click **Capture selection**.
- Creates structured prompts for auto intake, home intake, customer reviews, quote comparisons, customer emails, and general insurance work.
- Copies the prompt for ChatGPT or Codex, opens ChatGPT when requested, or saves the prompt as a text file.
- Masks SSN patterns, valid payment-card patterns, routing numbers with a routing label, CVV/CVC values, and password/passcode/PIN labels before copying.

## Install in Google Chrome

1. Open Chrome and enter `chrome://extensions` in the address bar.
2. Turn on **Developer mode** in the upper-right corner.
3. Select **Load unpacked**.
4. Choose this entire folder: `bill-layne-chrome-extension`.
5. Pin **Bill Layne Insurance Assistant** from Chrome's Extensions menu.
6. Open a normal website and click the extension icon. The assistant opens in Chrome's side panel.

After a code update, return to `chrome://extensions` and select the extension's **Reload** button.

## Recommended workflow

1. Open the policy, quote, carrier, or customer webpage you need.
2. Click the extension icon.
3. Choose **Capture page**, or highlight only the desired content and choose **Capture selection**.
4. Select the correct insurance workflow and add any special instructions.
5. Choose **Copy prompt + Open ChatGPT** or **Copy for Codex**.
6. Paste into your existing ChatGPT Pro or Codex conversation.
7. Review all extracted details against the carrier source before using the result.

## Privacy and security design

- No OpenAI API key is used.
- No data is submitted automatically.
- The extension has no blanket `host_permissions` and no always-running content script.
- `activeTab` access is granted only through your click on the extension and applies to the active tab.
- Captured information is held only in the open side-panel session. It is not saved to Chrome storage.
- Password and hidden inputs are excluded. Payment credentials and common high-risk number patterns are masked before copying.
- Chrome internal pages, the Chrome Web Store, and some protected browser/PDF pages cannot be captured.

This is an internal workflow aid, not a policy-management system. Avoid capturing information that is not needed for the task, and verify every final document against the original source.

## Files

- `manifest.json` — Manifest V3 permissions and extension entry points.
- `background.js` — Opens the side panel when the toolbar icon is clicked.
- `sidepanel.html` / `sidepanel.css` — Accessible Bill Layne-branded interface.
- `sidepanel.js` — On-demand capture, redaction, prompt templates, copy, and download behavior.
- `icons/` — Extension icons and editable SVG source.

For architecture, security decisions, validation evidence, limitations, and release maintenance, see `HANDOFF.md`.
