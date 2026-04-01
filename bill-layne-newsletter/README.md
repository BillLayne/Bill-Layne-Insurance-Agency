# Bill Layne Insurance Agency — Newsletter Manager

## What This Is
A monthly newsletter sending system for Bill Layne Insurance Agency. Parses Agency Matrix CSV exports, personalizes Gmail HTML newsletters, manages unsubscribes via Google Sheets, and sends via Gmail API.

## Quick Start
1. Upload your Agency Matrix CSV export on the Contacts tab
2. Edit or paste your newsletter HTML on the Newsletter tab
3. Set subject line and preheader text
4. Set up Apps Script backend (see Apps Script tab for instructions)
5. Click Send on the Send tab

## CSV Format
Export from Agency Matrix. The app reads: RECNO, Name, Business Name, Email. All other columns are ignored.

## Personalization Tokens
Use these in your newsletter HTML — Apps Script replaces them at send time:
- `{{FIRST_NAME}}` — recipient's first name
- `{{FULL_NAME}}` — full display name
- `{{EMAIL}}` — email address
- `{{UNSUBSCRIBE_LINK}}` — styled unsubscribe anchor
- `{{OPT_OUT_URL}}` — raw unsubscribe URL

## Gmail Sending Limits
- Free Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day
- The Apps Script adds 150ms delay between sends

## Apps Script Setup
See the Apps Script tab inside the app for complete step-by-step instructions. One-time setup, ~5 minutes.

## Tech Stack
- React + Vite
- PapaParse (CSV parsing)
- Google Apps Script (email sending backend)
- Google Sheets (opt-out tracking)
- Netlify (hosting)

## Development
```bash
npm install
npm run dev
```

## Deploy to Netlify
1. Push repo to GitHub
2. Log into netlify.com → Add new site → Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click Deploy Site
