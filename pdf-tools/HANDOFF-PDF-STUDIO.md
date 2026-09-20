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
| **Assemble** | Per-page thumbnails; **click to select pages, then "Add N to Step 3" together** (shift-click ranges, double-click adds one, drag still works); reorder by drag **or ◀ ▶ buttons** (touch); rotate; remove; combine across many files |
| **Edit a page** | Text boxes (movable, resizable, re-editable); white-out boxes (**permanent** option in Settings); **highlighter**; **freehand pen**; signatures **and initials** (draw or upload, saved per device); images; quick stamps (date, COPY/VOID/PAID, agency block, custom text + picture stamps, **stamp every page**, **agency-shared stamps**); **crop** (adjustable, confirm before apply); zoom −/Fit/+; Page-jump field + PageUp/PageDown; OCR of the page |
| **Forms** | AcroForm detection → "Fill form" modal (text/checkbox/radio/dropdown) → values written back into the real fields; forms **flatten automatically when you stamp on them** so the marks actually show (untouched forms stay fillable); Forms Library **packets** (ordered sets of library forms with reminders, shared by the office) |
| **Find** | Full-text search across loaded pages, gold-highlighted matches; 🔍 zoom viewer with prev/next; **OCR text counts** (per page from the editor, or "Read scanned pages" for every scan/photo) |
| **Output** | Save PDF; Preview; Send ▾ (Gmail draft with the PDF attached + styled body, **Text via SMS** hand-off, Print); Export ▾ (split by page ranges, single pages as ZIP, all new PDFs as ZIP); Settings (shrink for email, page numbers, lock with password, **permanent white-out**); several **new PDFs per project**; named **Projects** (local) |
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

### Full-page steps

Only one workspace is on screen at a time — Bill asked for the room.

```js
uiStep : 1 | 2 | 3      // 1 add files · 2 pick pages · 3 arrange & finish
```

`setStep(n)` toggles `body.step-3`, which hides `#sourcePane` and lets
`#trayPane` fill the page. Steps 1 and 2 both live in `#sourcePane` (the
dropzone *is* step 1). Tray visibility is CSS-driven (`#trayPane{display:none}`
+ `body.step-3 #trayPane{display:flex}`) — **don't reintroduce inline
`style.display` on the tray**, it would fight the step system.

`updateWorkflowState()` re-derives `uiStep` from real state on every render, so
clearing the tray, removing files, or Start over can never strand the user on an
empty step. The workflow indicator items are `<button>`s that navigate;
`stepAvailable(n)` disables the ones that aren't reachable yet. Navigation also
exists as **Back to pages** (`#btnBackStep2`) and **Step 3 (n)**
(`#btnGoStep3`, shown only when the tray has pages).

On step 3 the tray strip becomes a **wrapping grid** of larger cards. That is
why `trayInsertIndex(clientX, clientY)` is row-aware — it returns the insert
position by checking the pointer's row first, then the left/right half of a
card. Passing only X (the old behaviour) breaks reordering the moment the grid
has more than one row.

### Step 2 selection (source pages → tray)

```js
pickedSrc     : Set<sid>     // source pages selected but not yet sent to Step 3
lastPickedSid : sid | null   // anchor for shift-click ranges
```

Clicking a source page **selects** it; it does not add it. A sticky `#pickBar`
shows the count with Select all / Clear / **Add N to Step 3**, which calls
`addPickedToTray()` → `trayAdd()` for each pick in on-screen order (document by
document, page by page), then clears the selection. Shift-click ranges within a
document; Enter/Space selects; **double-click adds that one page immediately**;
dragging a card to the tray is unchanged.

**Selection must repaint in place** — `paintPick(sid)` toggles the class on the
card found by `card.dataset.sid`. Never call `renderSources()` from a click
handler: it rebuilds every card, which (a) destroys the card between the two
clicks of a double-click so `dblclick` never fires, and (b) makes a long page
list jump while the user is picking. `renderSources()` prunes sids that no
longer exist and calls `renderPickBar()` at the end.

Badge corners on a source card are all spoken for: **used-badge** top-right,
**hit-badge** (search match) top-left, **zoom-btn** bottom-right, **pick-check**
bottom-left. Anything new needs its own space.

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
| Source pane, search hits, zoom button | `renderSources` |
| **Step 2 page selection** | `togglePick`, `paintPick`, `pickedEntries`, `renderPickBar`, `addPickedToTray`; state = `pickedSrc` Set + `lastPickedSid`; markup `#pickBar` |
| New PDFs (outputs), Projects, workspace history | `outputs`/`activeOutput`, `switchOutput`, `saveActiveOutput`, `packedOutputs`; `projectStore` (IndexedDB `bliPdfProjects`), `saveProject`, `openProjects`; `captureHistory`/`travelHistory` (30 snapshots, Ctrl+Z/Y, also the editor's Undo) — Codex block near the end of the script |
| Delivery surface (Step 3 header) | markup `.output-actions`: `#btnCreate`, `#btnPreviewFinal`, `#sendMenuWrap` (Gmail / SMS / Print), `#moreMenuWrap` (Export), `#optMenuWrap` (Settings); menus self-position in `wireMenu` |
| Permanent white-out | `rasterizePages(bytes, indexes)`; wired in `buildFinalBytes` before numbering; option `permanent` in `exportOptions()` |
| OCR (tesseract.js, on demand) | `loadOCR`, editor `#btnOCR` dialog, bulk `#btnOcrAll`; `rememberOcr` → `doc.ocr[pageIndex]` → merged in `getDocTexts` |
| Packets + agency stamps | `sharedGet/sharedPut` (`/shared/<name>`), `renderPackets`, `openPacket`, `libraryDocsInOrder`, `tagLibraryDoc`; `loadSharedStamps`, `renderSharedStamps`, `shareStamp` |
| Initials | `sigKind` ('sig' \| 'ini'), `INI_KEY`, `setSigKind`; placement width `currentSigW` (60 vs 150 pt) |
| Editor page jump / tips | `jumpEditor`, `#editorPageJump`, PageUp/PageDown in the editor keydown; `HINTS_KEY` + `applyHintPref` |
| Gmail memory | `applyMailType` (type + file name → subject), `rememberRecipient`/`renderRecentTo` (`bliPdfRecentTo`, datalist `#mailToList`) |
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
- API: `GET /list` · `GET|DELETE /file/<key>` · `POST /upload` (body = bytes, headers `x-name` urlencoded, `x-pages`; 30 MB cap) · `POST /rename/<key>` (`x-name`) · **`GET|PUT|DELETE /shared/<name>`** — small agency-wide JSON documents stored at `_shared/<name>.json` (hidden from `/list`, 2 MB cap): `packets` and `stamps`. Same access code; never customer data.
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
| 16 | White-out, highlight, and crop **hide** content by default — the text is still in the file | Only **Permanent white-out** (Settings) removes it, and only on pages that carry a white-out, by re-saving that page as a picture. Never call the default a redaction |
| 17 | Re-rendering a list inside a click handler kills the following `dblclick` (the element it fired on is gone) and scrolls the user's place away | Repaint in place — see `paintPick()` in §3 |
| 18 | **Stamps drawn over a fillable form field vanish from the saved/printed file** while the editor preview looks right — widgets are annotations and annotations paint ON TOP of page content | `buildPdfBytes` flattens the source form when any stamp/crop exists, then deletes the leftover `/Annots` on the copied page. Untouched forms stay fillable. Never "fix" this by drawing stamps earlier — order can't beat an annotation |
| 19 | Two contributors edit `pdf-tools/index.html` (Claude here, Bill + Codex on GitHub) | **`git fetch` and check `HEAD..origin/main` before editing**; Codex works in worktrees under `Playground\`, never hand-delete one (`git worktree remove`, and its files are owned by the `CodexSandboxOffline` account so `takeown` is needed) |
| 20 | A `.menu-panel` anchored by CSS (`right:0`) lands off-screen the moment its button sits in a different grid column or the tray moves to the top of the page | `wireMenu` measures the panel when it opens and adds `flip` (right-anchored) or `unflip` (left-anchored); Step 3 panels open **downward** (no `up` class) because the tray header is at the top now |
| 21 | Codex's mobile CSS reset `.save-button` to `grid-column:auto`, so Save stopped spanning the phone row | Removed; `.output-actions > #btnCreate {grid-column:1/-1}` is the rule that spans it |
| 22 | pdf.js `annotationMode: 2` (ENABLE_FORMS) does **not** paint form widgets onto the canvas | When testing whether something is visually covered, render with the default mode |
| 23 | `tagLibraryDoc` tags the **last** document in `docs` after `addPdfData` | It checks the name matches and no key is set; if `addPdfData` ever becomes concurrent, return the docId from it instead |
| 24 | Shared stamps and packets are agency-wide behind ONE code; signatures/initials are deliberately per device | Do not "complete the feature" by sharing signatures — that would let anyone apply anyone's signature |

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

- Source page cards are focusable: Enter/Space **selects** a page (see §3); the pick bar adds the selection.
- Tray cards are focusable: Left/Right reorders, Enter opens the editor, Delete/Backspace removes with Undo.
- Visible 3px focus rings are intentional. Do not remove them.
- Escape continues to close menus, panels, and modals in the established retreat order.
- Keep actionable labels and `aria-label` text when changing icons; do not revert to emoji-only buttons.

### Safety boundary

The premium interface is a shell around the existing implementation. Keep `buildPdfBytes()` as the only visual/output build path, keep all existing element IDs unless every listener/test hook is updated, and verify a real PDF load → page select → editor open → reorder → Save PDF flow after any layout change.


## 14. Review follow-up — September 2026

Bill asked for a review of the whole program and then for every recommendation to be built ("do what you would do"). Shipped in three phases, each verified in the dev preview with `window.PDFStudio` hooks before pushing.

### Phase A — flow and surface (commit 1273133)
- **Progressive disclosure.** `body.has-files` / `body.multi-output` (set in `updateWorkflowState` and `renderOutputSelect`) hide the output shelf and the connection chips until a file exists; with one new PDF the shelf is just Undo/Redo until Step 3. Landing went from 12 visible controls to 6.
- **One delivery surface** on Step 3: Save PDF · Preview · Send ▾ · Export ▾ · Settings. Codex's "More save & send options" and "Manage documents" dialogs were deleted (they duplicated these). Phone: Save spans the row, the other four share one row (`.output-actions` 4-column grid ≤600px, icons hidden).
- **Menus self-position** (gotcha 20). Phone shelf: label/select and Remove hidden for single-PDF projects, Duplicate hidden.
- Renames: shelf label "New PDF", "+ Another PDF", "Remove this PDF"; "Text via SMS". The ✓ badge in Step 2 counts every new PDF (`usage` map over `tray` + other `outputs`), outlined + tooltip when the page lives elsewhere.
- Tray: rotate both ways (`act-rotl` = +270°); Move page has an icon.
- Editor: `Page [n] of N` jump + PageUp/PageDown; tips bar dismissible (`bliPdfHintsOff`, "Show tips again" in the ⋯ menu); compact context bar (`.edit-context.compact`, 40 px) for tools without settings.
- Autosave/projects report `QuotaExceededError` ("Autosave paused — too large for this browser") instead of "Saving…" forever.

### Phase B — features (commit 12cbb6e)
- **Permanent white-out** (`chkPermanent`, `exportOptions().permanent`): in `buildFinalBytes`, before page numbers, every list item with a `box` stamp is rasterized by `rasterizePages` (pdf.js render ≤2400 px → JPEG 0.88 → `insertPage(i)` + `removePage(i+1)`), so the covered text leaves the file. Verified: the page has zero text items and a white pixel under the box; other pages untouched. Editor white-out hint points to it.
- **OCR feeds Find**: `rememberOcr` stores `doc.ocr[pageIndex]`, invalidates `docTextCache`; `getDocTexts` merges it (image docs become searchable too). Bulk "Read scanned pages (OCR)" in the ⋯ source menu reads every page with <20 chars of text, with progress + Stop. `ocr` rides along in autosave/restore/projects.
- **Stamp every page** checkbox in the stamp panel: `placeCenteredText` copies the stamp to every other tray item (same coordinates).
- **Initials**: second saved list (`bliPdfStudioInitials`), toggle in the signature panel, placed at 60 pt wide.
- **Gmail memory**: subject = type default + file name (kept when the user typed their own — `lastAutoSubject`); last 10 recipients in a datalist.

### Phase C — agency-wide extras (commit 7dc6fbf; Worker commits 75f24dd, e02aa12)
- Forms host: `GET|PUT|DELETE /shared/<name>` (see §8).
- **Packets** in the Forms Library modal (`#packetsBox`): "Save current forms as a packet" takes the library docs in the workspace (ordered by first appearance in the tray — `libraryDocsInOrder`) plus reminders; "Open packet" loads each form, tags it, places every page in Step 3 in packet order, then lists reminders/missing forms in a dialog. Library docs carry `libKey`/`libName` (autosaved).
- **Agency stamps** in the stamp panel (`#sharedStamps`): ↑ on a local text/picture chip shares it; shared chips have a dashed ring and a two-click remove. 5-minute cache. Signatures stay local (gotcha 24).

### Storage added this session
localStorage `bliPdfHintsOff`, `bliPdfStudioInitials`, `bliPdfRecentTo`; doc fields `ocr`, `libKey`, `libName`; R2 `_shared/packets.json`, `_shared/stamps.json`.

### Not done, on purpose
- Cloud projects (customer documents off-device) — would break the privacy promise that makes staff trust the tool.
- Reformatting Codex's one-line-per-feature block: semantics-preserving but it would bury their authorship in the diff; leave it until a real edit is needed there.

## 15. Integration release — 2026-09-07 (Codex's note)

Bill approved all PDF Studio review recommendations. Implemented and locally verified. Publishing authorized by Bill (push please); both main branches pushed. PDF branch `codex/pdf-studio-workflow`, commit `90e249c`, checkout `C:/Users/bill/OneDrive/Documents/Playground/pdf-studio-workflow`. Companion SMS branch `codex/pdf-studio-import`, commit `85aaa35`, checkout `C:/Users/bill/OneDrive/Documents/Playground/sms-pdf-studio-import`. SMS published first: Worker version ff8a1f4c-b740-4a65-b58e-c8017dfec83e. Website GitHub Pages run 34166401502 succeeded. Production PDF HTML matches commit 90e249c after line-ending normalization; production SMS serves index-Cjms5Fxj.js. Live PDF UI and Connections dialog checked at desktop/mobile widths without horizontal overflow. Existing browser recovery data preserved; no production customer upload, Gmail draft, or SMS send was performed. Read `C:/Users/bill/OneDrive/Documents/Playground/pdf-review-samples/INTEGRATION.md` for full scope, tests, limits, and release steps. One-file PDF architecture retained; original service-center work untouched.


