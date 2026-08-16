# HANDOFF — PDF Studio (`/pdf-tools/`)
### The agency's in-browser PDF workshop: split, combine, edit, sign, fill, lock, print, email

**Audience:** any future Claude/Codex session or developer changing, extending, or debugging PDF Studio.
**Live:** https://www.billlayneinsurance.com/pdf-tools/ — `noindex`, and **deliberately not linked from any site nav** (Bill's rule: the homepage top nav is locked; new pages go in drawer/dock menus only, and this one is shared by URL).
**Source:** `pdf-tools/index.html` — **one self-contained file** (~5,000 lines). No build step, no framework, no bundler. Edit it and push; GitHub Pages serves it.
**Companion service:** `Documents\bli-form-host` (Cloudflare Worker + R2) — the online Forms Library. See §8.
**Email layer:** documented separately in `mail-gateway/HANDOFF-GATEWAY-INTEGRATION.md`, `HANDOFF-ATTACH-PDF-TO-GMAIL.md`, `HANDOFF-STYLED-DRAFT-BODY.md`. See §9.

---

## 1. What it does (feature inventory)

| Area | Features |
|---|---|
| **Input** | Drop/browse PDFs and images (JPG/PNG/WebP/GIF/BMP → become PDF pages); password-protected PDFs (prompt + unlock); Forms Library (cloud); camera capture on phones (native file input) |
| **Assemble** | Per-page thumbnails; click or drag pages into the New Document tray; reorder by drag **or ◀ ▶ buttons** (touch); rotate; remove; combine across many files |
| **Edit a page** | Text boxes (movable, resizable, re-editable); white-out boxes; **highlighter**; **freehand pen**; signatures (draw or upload, saved); images; quick stamps (date, COPY/VOID/PAID, agency block, custom text + picture stamps); **crop** (adjustable, confirm before apply); zoom −/Fit/+ |
| **Forms** | AcroForm detection → "Fill form" modal (text/checkbox/radio/dropdown) → values written back into the real fields |
| **Find** | Full-text search across loaded pages, gold-highlighted matches; 🔍 zoom viewer with prev/next |
| **Output** | Create PDF; Print; **Gmail draft with the PDF attached + styled email body**; split into single pages; page numbers; "shrink for email"; **lock with password** |
| **Safety** | Auto-save + restore (IndexedDB); Undo toasts on removals; nothing uploaded except Forms Library (blank forms only) |

**The privacy promise, stated on the page:** customer documents never leave the browser. The **only** network calls are (a) the three CDN libraries, (b) the Forms Library API (blank agency forms), (c) the Mail Gateway when Bill clicks Gmail draft. Keep it that way — it is the reason the tool is trusted with client files.

## 2. Architecture

```
index.html  (single file)
├── <style>            all CSS, custom properties, media queries
├── markup             header · source pane · tray · modals · <script type="text/plain" id="emailTpl">
└── <script>           one IIFE, no modules
```

Three CDN libraries (cdnjs, pinned versions):

| Library | Role |
|---|---|
| **pdf.js 3.11.174** | *Reading*: render pages to canvas (thumbnails, editor, viewer, print), extract text (search), detect encryption |
| **pdf-lib 1.17.1** | *Writing*: copy pages, draw stamps, set boxes, fill forms, save bytes |
| **qrcodejs 1.0.0** | Phone-setup QR only |
| *(on demand)* **@cantoo/pdf-lib 2.5.3** | Encryption only — see §6 "lock" |

**Golden rule — one build path.** Everything visual flows through **`buildPdfBytes(list)`** (line ~1947): the editor preview, the zoom viewer, tray thumbnails after a crop, print, email, and the final download. That is why a stamp, crop, or rotation looks identical everywhere. **Do not add a second rendering path** — extend `buildPdfBytes` instead.

```
tray items ──► buildPdfBytes()      apply crop → rotate → poster-scale → drawStamps()
                    │
                    ├──► buildFinalBytes()  page numbers → shrink → lock   ──► Create / Print / Email
                    ├──► renderEditor()     (base page, stamps: [])        ──► editor canvas
                    └──► renderViewer() / regenTrayThumb()
```

## 3. Data model

```js
docs      : Map<docId, {
              name, bytes:Uint8Array, formFields:number,
              pages: [{ sid, docId, pageIndex, thumb }],
              // images only:
              kind:'image', imgType:'jpg'|'png', imgW, imgH
            }>
srcIndex  : Map<sid, pageEntry>          // fast lookup for drag-and-drop
tray      : [{ tid, docId, pageIndex, rot, stamps:[], crop?:{x,y,w,h}, thumb }]
```

**Stamp kinds** (all coordinates in **PDF user-space points**, origin bottom-left):

| kind | shape | baked as |
|---|---|---|
| `text` | `{x, y, text, size, color}` | `drawText` + `rotate: degrees(pageRotation)` |
| `box` | `{x, y, w, h}` | white `drawRectangle` |
| `hl` | `{x, y, w, h}` | yellow `drawRectangle`, `opacity: 0.38` |
| `ink` | `{pts:[[x,y]…], color, size}` | per-segment `drawLine`, round caps |
| `sig` / `img` | `{dataUrl, x, y, w, h}` | `embedPng`/`embedJpg` + `drawImage`, bitmap pre-rotated for rotated pages |

`crop` lives on the **tray item**, not in stamps, because it changes the page box rather than painting on it.

## 4. The editor coordinate system (the part that breaks if you're careless)

The editor renders the page at **2× device resolution** and displays it at half size, so three coordinate spaces coexist:

| Space | Where | Convert |
|---|---|---|
| PDF points | what we **store** | — |
| Canvas px | pdf.js viewport | `editorVp.convertToViewportPoint(x,y)` / `.convertToPdfPoint(cx,cy)` |
| CSS px | what the user clicks | multiply/divide by `CSSF = 0.5` |

Key globals: `editorVp` (viewport at `scale = fit*2`), `editorFit` (= base fit × `editorZoom`), `CSSF = 0.5`, `BASE = 0.9` (first-line baseline offset inside a `line-height:1.2` text box).

Helpers to use — never hand-roll the math: `pdfToCss()`, `cssToPdf()`, `positionTextEl()` / `commitTextPos()`, `positionBoxEl()` / `commitBoxPos()`, `overlayToPdfPoint(e)`.

Because everything is stored in PDF points and mapped through `editorVp`, **zoom, page rotation, and crop all stay correct for free**. If you add a tool, capture with `overlayToPdfPoint()` and you inherit that.

Layer stack inside `#editStack`:

```
#editCanvas    the rendered page (2×)
#editOverlay   canvas — marquee previews AND baked-in-preview pen strokes
#stampLayer    HTML elements — text/box/hl/sig/img containers + pending crop box
```

Pen strokes are **canvas**, not elements (a path can't be a div). Consequence: **`redrawInk()` must run after anything that clears or rescales the overlay** — render, zoom, marquee drag, undo. It is already called from `syncStampLayer()`; keep it that way.

## 5. Where each feature lives (jump table)

| Feature | Start here |
|---|---|
| Loading files / images / passwords | `addFiles`, `addImageData`, `addPdfData`, `askPassword` (~1466–1635) |
| Source pane, search hits, zoom button | `renderSources` (~1638) |
| Tray, ◀▶ reorder, card buttons | `renderTray` (~1746) |
| **Build engine** | `drawStamps` (~1892), `buildPdfBytes` (~1947) |
| Editor shell, modes, zoom | `setEditorMode`, `setEditorZoom`, `openEditor`, `renderEditor` (~2011–2104) |
| Stamp elements (drag/resize/edit) | `buildStampEl`, `startDrag`, `startResize`, `startTextEdit` (~2170–2280) |
| Pen + highlighter | `drawInkOn`, `redrawInk`, pointer handlers, marquee `mouseup` (~2290–2420) |
| Crop (pending → confirm) | `showPendingCrop`, `applyCrop`, `regenTrayThumb` |
| Signatures / stamps libraries | `openSigPanel`, `trimCanvas`, `renderStampChips`, `renderImgStampChips` |
| Form filling | `openFormModal`, `btnFormApply`, `rebuildThumbs` |
| Output options | `addPageNumbers`, `compressPdfBytes`, `lockPdfBytes`, `buildFinalBytes` (~3286–3400) |
| Email | `buildEmailHtml`, `btnEmailGo` (~3549–3660) |
| Print | `btnPrint` handler |
| Auto-save / restore | `sdb`, `scheduleAutosave`, `offerRestore` (~3811–3975) |
| Forms Library | `formsApi`, `renderFormsList`, `addFormToLibrary` (~3979–4160) |

## 6. Output options — how each works

- **Page numbers** (`addPageNumbers`) — maps display-bottom-center through `convertToPdfPoint` and draws with `rotate: degrees(R)`, so numbers sit correctly on rotated pages.
- **Shrink for email** (`compressPdfBytes`) — re-renders every page to a ~150dpi JPEG page. **Flattens text** (no longer selectable). Keeps the original if compression wouldn't help, and reports before/after.
- **Lock with password** (`lockPdfBytes`) — stock pdf-lib **cannot encrypt**, so the `@cantoo/pdf-lib` fork is loaded on demand and **immediately removed from `window.PDFLib`** (`getCantoo()`), because the rest of the app must keep running on stock pdf-lib. Don't "simplify" that restore line.
- **Poster-page guard** (inside `buildPdfBytes`) — some scanners write pixel counts as page points (a real case: 2400×3181pt = 33×44in), which prints partially. Any page over ~1450pt on its long side is scaled to letter, orientation preserved.

## 7. Storage map

**IndexedDB `bliPdfStudio` (v3)**

| Store | Key | Contents |
|---|---|---|
| `session` | `current` | Auto-saved workspace: doc bytes, tray, stamps, crops, file name. Debounced 1.2s via `scheduleAutosave()`; offered back by `offerRestore()`. |
| `settings` | — | Leftovers from the retired watch-folder feature (cleaned on load). |
| `forms` | id | **Legacy** local forms library, superseded by the cloud (§8). |

**localStorage**

| Key | Purpose |
|---|---|
| `bliPdfStudioSigs` | Saved signatures (PNG data URLs, max 6) |
| `bliPdfStudioTextStamps` / `bliPdfStudioImgStamps` | Custom quick stamps |
| `bliPdfThumbSize` | `sm` / `md` / `lg` |
| `bliFormsCode` | Forms Library access code |
| `bliMailGateway.url` / `.secret` | Mail Gateway (shared with every BLI page on this origin) |

All of it is **per browser, per device** — by design. The phone-setup QR (§9) copies the two connection codes to another device.

## 8. Forms Library — the online piece

Shared library of **blank agency forms** (ACORD, underwriting, carrier). **Never customer documents.**

- Worker source: `Documents\bli-form-host` (`worker.js`, `wrangler.toml`) — not yet in git.
- Live: `https://bli-form-host.bill-7e3.workers.dev`, R2 bucket `bli-forms`, binding `FORMS`.
- Auth: `x-forms-code` header (or `?code=`) vs the `FORMS_CODE` secret. Code: **granite-forms-1993** (Bill's `granite-*` convention). Rotate from Git Bash — PowerShell pipes prepend a BOM:
  ```bash
  printf 'new-code' | npx wrangler secret put FORMS_CODE
  ```
- API: `GET /list` · `GET|DELETE /file/<key>` · `POST /upload` (body = bytes, headers `x-name` urlencoded, `x-pages`; 30 MB cap) · `POST /rename/<key>` (`x-name`).
- CORS allowlist: www + apex billlayneinsurance.com + `localhost:8080`. Workers *can* answer `OPTIONS` (unlike Apps Script — that's why this one takes normal JSON-ish requests while the Mail Gateway needs `text/plain`).
- Client: one-time code entry per device; `formsApi()` clears a bad code **only if it's still the code that failed** (prevents a slow stale request from wiping a freshly typed good one).
- Deploy: `cd Documents\bli-form-host && npx wrangler deploy`.

## 9. Email integration (summary — details in the mail-gateway handoffs)

"✉ Gmail draft" builds the tray PDF, base64s it, and POSTs to the **BLI Mail Gateway** (Apps Script running as Bill) which creates a **draft** — never an auto-send — with the PDF attached and `Save@BillLayneInsurance.com` BCC'd as the E&O record copy.

The body is Bill's **Gold Elite "Document Delivery" template**, stored in the page as `<script type="text/plain" id="emailTpl">`. **Use `type="text/plain"`, never `<template>`** — the HTML parser strips `<html>/<head>/<body>` inside a `<template>`, which would destroy the email document. Fill order: escape user values → `replaceAll` tokens → strip/keep `IF_NOTE` / `IF_LOCKED` comment blocks → **one** final non-ASCII entity pass.

The "What is this delivering?" dropdown swaps `{{HEADLINE}}`/`{{INTRO_LINE}}`/subject for five document types from that one template.

**Staff note:** the Gmail button only works on a device holding Bill's gateway credentials. Staff use **Create PDF** and attach in their own mail client, or (future) deploy their own gateway copy — the `Save@` BCC is baked into the gateway code, so it survives per-staff deployments.

## 10. Gotcha index — every one of these cost real debugging time

| # | Gotcha | Rule |
|---|---|---|
| 1 | pdf.js `page.render()` paces with `requestAnimationFrame` → **hangs forever in a background tab** | Always pass `intent: 'print'` to render params |
| 2 | pdf-lib **cannot decrypt** an encrypted PDF | Unlock by rasterizing pages through pdf.js with the password, then rebuild |
| 3 | pdf-lib **cannot encrypt** | Load the `@cantoo` fork on demand and restore `window.PDFLib` immediately |
| 4 | Scanner "poster" pages (30in+) print partially | Scale anything > ~1450pt long-side to letter in `buildPdfBytes` |
| 5 | Hiding via stylesheet `display:none` then showing with `el.style.display=''` does nothing | Use inline `style="display:none"` when JS toggles with `''` |
| 6 | `setPointerCapture` throws on an unknown pointerId | Wrap in `try/catch` |
| 7 | Hash-only navigation does **not** reload the page | The phone-setup handler needs a `hashchange` listener as well as the load-time call |
| 8 | `String.fromCharCode.apply` on a multi-MB array blows the stack | Chunked base64 (`0x8000`) |
| 9 | `<template>` strips `html/head/body` | Store full email documents in `<script type="text/plain">` |
| 10 | GmailApp corrupts emoji/astral characters | Entity-escape non-ASCII **once**, as the final step; strip astral from subjects |
| 11 | Chrome silently auto-cancels `window.confirm/alert/prompt` in send flows | In-page modals and banners only — never native dialogs near sending |
| 12 | Pen strokes vanish when the overlay is cleared or rescaled | `redrawInk()` after render/zoom/marquee/undo |
| 13 | Stamp elements swallow pointer events while drawing | `#stampLayer.drawing .stamp-el { pointer-events: none }` |
| 14 | GitHub Pages caches HTML ~10 min | When verifying a fresh deploy in an open tab, cache-bust with `?v=`; **verify data against the API, never a rendered list** |
| 15 | Double quotes inside a PowerShell `@'…'@` commit message break arg parsing | Keep commit messages quote-free |
| 16 | White-out, highlight, and crop **hide** content, they don't remove it | Never describe any of them as redaction |

## 11. Extending it safely

1. **Add to `buildPdfBytes`/`drawStamps`, not around them** — that's what keeps preview, print, and output identical.
2. **Store coordinates in PDF points**, captured via `overlayToPdfPoint()`.
3. **Test hooks** are exposed on `window.PDFStudio` for browser automation (this is how every feature here was verified):
   ```js
   window.PDFStudio.addPdfData(name, bytes)   // load a doc
   window.PDFStudio.addImageData(name, blob)
   window.PDFStudio.addAllToTray()
   window.PDFStudio.addPageToTray(docNo, pageIndex)
   window.PDFStudio.openEditorFor(trayIndex)
   window.PDFStudio.buildPdfBytes(list)       // bake and inspect
   window.PDFStudio.getState()                // {docs, tray} incl. stamps + crop
   window.PDFStudio.formsAdd / formsList
   ```
   Typical check: build a synthetic PDF with pdf-lib in the page, drive the UI, then re-open the output with pdf.js and assert on extracted text / page sizes / rotations.
4. **Verify, then deploy:** local preview is `python -m http.server 8080` (launch.json entry `dev`) at `http://localhost:8080/pdf-tools/`. Push, then poll the live URL for a string from the new code before declaring it live.
5. **Keep it one file.** The single-file constraint is a feature: no build step, trivially portable, and staff can't get a half-loaded app.

## 12. Related memory / docs

- `mail-gateway/HANDOFF-*.md` — the three email-layer handoffs (gateway, attachments, styled body).
- Claude memory: `project_pdf_studio.md` (full build history, decisions, dated entries) and `project_bli_form_host.md`.
- Related agency tooling that could reuse these patterns: Quote Template Studio, Letterhead PDF Generator, Card Generator.

## 13. Premium staff interface (August 2026)

The frontend was refined into a premium PDF workstation without changing the PDF engine, privacy model, storage model, integrations, or the one-file architecture.

### Main workspace

- Dark navy/gold agency header with a proper `h1`, concise product description, Forms Library action, and private-device trust badge.
- Three-step workflow indicator: **Add files → Arrange & edit → Save or send**. `updateWorkflowState()` advances it from the real `docs` and `tray` state.
- Device-status row reports local autosave, Forms Library connection, and Gmail connection. Never put secrets in these labels.
- Opening state has one explicit primary action (`#btnBrowseFiles`), a secondary Forms Library action, supported-file guidance, and a short privacy promise.
- Loaded documents remain in the proven top source area. The bottom horizontal tray remains the canonical final page order.
- The bottom tray is now a finishing dock: filename, Save PDF, Print, Gmail draft, Export settings, page count, and selected-page strip.

### Editor

- Desktop editor uses one canonical left tool rail: Text, Highlight, Pen, White-out, Signature, Image, Stamps, Crop.
- The top context bar changes through `setEditorMode()` and shows only controls relevant to the selected tool.
- Undo, zoom, more actions, and Done stay in the dark editor header.
- On phones the tool rail becomes a horizontally scrollable row; the editor remains full-screen.

### Design system

- Local system font stack only: `Segoe UI Variable`, Aptos, Segoe UI, system UI. Do not add an externally hosted font.
- Navy is brand chrome, blue is the single primary-action/selection color, teal is privacy/success, gold is special status/search, and red is destructive only.
- Standard controls are at least 38px high; tray-card controls are 32px; small operational text should not fall below 11.5–12px.
- Core interface icons are inline SVG so they render consistently without another network request.
- White documents stay on neutral surfaces; the editor canvas surround is dark to focus attention on the page.

### Keyboard and accessibility

- Source page cards are focusable: Enter/Space adds a page.
- Tray cards are focusable: Left/Right reorders, Enter opens the editor, Delete/Backspace removes with Undo.
- Visible 3px focus rings are intentional. Do not remove them.
- Escape continues to close menus, panels, and modals in the established retreat order.
- Keep actionable labels and `aria-label` text when changing icons; do not revert to emoji-only buttons.

### Safety boundary

The premium interface is a shell around the existing implementation. Keep `buildPdfBytes()` as the only visual/output build path, keep all existing element IDs unless every listener/test hook is updated, and verify a real PDF load → page select → editor open → reorder → Save PDF flow after any layout change.
