# HANDOFF — PDF Studio (`/pdf-tools/`)
### The agency's in-browser PDF workshop: split, combine, edit, sign, fill, lock, print, email

> **This file is PUBLIC.** It is committed to a public GitHub repo and the website serves it at `/pdf-tools/HANDOFF-PDF-STUDIO.md`. Never write an access code, secret, token or gateway URL in it — those live in Bill's records and in Claude's local memory only.

**Audience:** any future Claude/Codex session or developer changing, extending, or debugging PDF Studio.
**Live:** https://www.billlayneinsurance.com/pdf-tools/ — `noindex`, and **deliberately not linked from any site nav** (Bill's rule: the homepage top nav is locked; new pages go in drawer/dock menus only, and this one is shared by URL).
**Source:** `pdf-tools/index.html` — **one self-contained file** (~7,700 lines). No build step, no framework, no bundler. Edit it and push; Cloudflare Pages deploys every push to `main`.
**Companion service:** `Documents\bli-form-host` (Cloudflare Worker + R2) — the online Forms Library. See §8.
**Email layer:** documented separately in `mail-gateway/HANDOFF-GATEWAY-INTEGRATION.md`, `HANDOFF-ATTACH-PDF-TO-GMAIL.md`, `HANDOFF-STYLED-DRAFT-BODY.md`. See §9.

---

## 1. What it does (feature inventory)

| Area | Features |
|---|---|
| **Input** | Drop/browse PDFs and images (JPG/PNG/WebP/GIF/BMP → become PDF pages); password-protected PDFs (prompt + unlock); Forms Library (cloud); camera capture on phones (native file input) |
| **Assemble** | **All on one screen** (pages · live page · tools — see §3): source pages are picked on the *Source files* tab (**click to select, then "Use N selected pages"**; shift-click ranges, double-click adds one, *Add every page*); the *Pages* tab lists the new PDF — reorder by drag, **◀ ▶ on touch**, or the keyboard; rotate, **duplicate**, remove, **add a blank page**; several pages at once (Ctrl/Shift-click); page pictures that **follow your edits**; combine across many files |
| **Edit a page** | **Select** tool (move / resize / delete what you added — the default in the workspace); text boxes (movable, resizable, re-editable); white-out boxes (**permanent by default** — Settings can turn it off); **highlighter**; **freehand pen**; signatures **and initials** (draw or upload, saved per device); images; quick stamps (date, COPY/VOID/PAID, agency block, custom text + picture stamps, **stamp every page**, **agency-shared stamps**); **crop** (adjustable, confirm before apply); zoom −/Fit/+; Page-jump field + PageUp/PageDown; OCR of the page |
| **Forms** | AcroForm detection → "Fill form" modal (text/checkbox/radio/dropdown) → values written back into the real fields; forms **flatten automatically when you stamp on them** so the marks actually show (untouched forms stay fillable); Forms Library **packets** (ordered sets of library forms with reminders, shared by the office) |
| **Find** | Full-text search across loaded pages, gold-highlighted matches; 🔍 zoom viewer with prev/next; **OCR text counts** (per page from the editor, or "Read scanned pages" for every scan/photo) |
| **Output** | One finishing action, **Preview & finish**, with a gold **Finish** in its header that ends the job (saves the PDF unless it already left the app, keeps the project under Recent projects, closes it): the finished PDF with Save PDF, Gmail draft (PDF attached + styled body), **Text via SMS** hand-off, Print, the four finish options (shrink for email, page numbers, lock with password, **permanent white-out**) and the exports (split by page ranges, single pages as ZIP, all new PDFs as ZIP). The ⋯ button beside it has the same actions without the preview. Several **new PDFs per project** (project chip menu); named **Projects** (local) — the back arrow offers *Save project & close* |
| **Safety** | Auto-save + restore (IndexedDB); Undo toasts on removals; nothing uploaded except Forms Library (blank forms only) |

**The privacy promise, stated on the page:** customer documents never leave the browser. The **only** network calls are (a) the three CDN libraries, (b) the Forms Library API (blank agency forms), (c) the Mail Gateway when Bill clicks Gmail draft. Keep it that way — it is the reason the tool is trusted with client files.

## 2. Architecture

```
index.html  (single file)
├── <style>            all CSS, custom properties, media queries
├── markup             header · .ws-bar · .ws-grid (left column: tabs + source pane + pages pane · the editor) · modals · <script type="text/plain" id="emailTpl">
└── <script>           one IIFE, no modules
```

Three CDN libraries (cdnjs, pinned versions):

| Library | Role |
|---|---|
| **pdf.js 3.11.174** | *Reading*: render pages to canvas (thumbnails, editor, viewer, print), extract text (search), detect encryption |
| **pdf-lib 1.17.1** | *Writing*: copy pages, draw stamps, set boxes, fill forms, save bytes |
| **qrcodejs 1.0.0** | Phone-setup QR only |
| *(on demand)* **@cantoo/pdf-lib 2.5.3** | Encryption only — see §6 "lock" |

**Golden rule — one build path.** Everything that leaves the app, and everything you look at closely, flows through **`buildPdfBytes(list)`**: the editor page, the zoom viewer, the page pictures in the list, print, email, and the final download. That is why a stamp, crop, or rotation looks identical everywhere. **Do not add a second rendering path** — extend `buildPdfBytes` instead.

One deliberate exception, for speed: the 170 px card picture of *the page on screen* is painted by `editorThumb()` from the editor's own canvas plus its stamps (it would otherwise rebuild the page after every edit). It is a picture in a list, never output. If you add a stamp kind, teach `drawStamps` **and** `editorThumb`.

`buildPdfBytes` parses each source through **`loadSource(docId, doc, forFlatten)`**, which keeps the last three parsed sources (the workspace builds one page per page switch). A source that must be flattened is always parsed fresh — **never mutate a parsed source that came from the cache**.

```
tray items ──► buildPdfBytes()      apply crop → rotate → poster-scale → drawStamps()
                    │
                    ├──► buildFinalBytes()  page numbers → shrink → lock   ──► Create / Print / Email
                    ├──► renderEditor()     (base page, stamps: [])        ──► editor canvas
                    └──► renderViewer() / bakeThumb()        (card pictures of pages not on screen)
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
tray      : [{ tid, docId, pageIndex, rot, stamps:[], crop?:{x,y,w,h}, thumb,
               thumbRot?, thumbKey? }]        // the card picture: rotation baked into it, and what it was baked from
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

### The workspace — one screen once a file is open (October 2026)

Bill's mockup: pages on the left, the live page in the middle, tools on the right.

```
header.app-header        BL mark · PDF Studio · Forms Library / Projects / Help
main
├─ .ws-bar               ‹ back · file name (#nameInput) · project chip (#btnDocMenu) · the three stages ·
│                        ⋯ (#btnWsMore) · Preview & finish (#btnPreviewFinal)
└─ .ws-grid
   ├─ .ws-left           .ws-tabs (#wsTabPages | #wsTabSources), then ONE of
   │    #trayPane          the pages of the new PDF            (uiStep 3, body.step-3)
   │    #sourcePane        the source files and their pages    (uiStep 2) — and, with no file open, the home screen
   └─ #editModal         .edit-panel = .ws-center (toolbar .ed-bar + #editCanvasWrap) | aside.ws-right (tools, options, Page actions)
footer                   "Edited on this device" · page count · autosave / connection chips · version
```

**Two modes, one markup.** `wsMode()` = `matchMedia('(min-width: 1024px)')` **and** a file is open; `updateWorkflowState()` mirrors it onto `body.ws` for the CSS. JS asks `wsMode()`, CSS reads `body.ws`.

| | `body.ws` (≥ 1024 px) | narrower |
|---|---|---|
| layout | three panes side by side | one pane at a time; the bar wraps to two rows |
| `#editModal` | a grid cell that always shows a page (or the "choose the pages" empty state, `.ws-empty`) | `position:fixed` full-screen editor: opened by tapping a card, closed with Done |
| tools | the grid in `.ws-right` | 601–1023 px: the same grid in a 272 px side column · ≤ 600 px: the `#mobileTool` select + "Tool settings" dialog |
| tool when a page opens | whatever you had (starts as **Select**) | **Add text**, as before |
| page cards | one column, drag to reorder | a grid, ◀ ▶ buttons to reorder |
| click a card | shows that page | opens the editor on it |

`uiStep` is unchanged underneath: **1** = home · **2** = Source files tab · **3** = Pages tab (`body.step-3` swaps `#sourcePane` for `#trayPane`; visibility is CSS-driven — **don't put inline `style.display` on either pane**). The stage indicator is derived: `stage = uiStep === 3 ? 2 : 1`, and stage 3 "Finish" is the `previewFinal()` dialog. `updateWorkflowState()` re-derives `uiStep` from real state on every render (an emptied PDF falls back to Source files), so nobody is stranded; undo paths that bring pages back return to the Pages tab (`restoreTray`, `fromHome` in `restoreWorkspace`).

**`syncEditor()` runs at the end of every `renderAll()`** and alone decides which page is on screen:
- it re-binds `editorItem` by `tid` when the tray's objects were replaced (undo, `switchOutput`, opening a project) — **never keep another long-lived reference to a tray item**;
- in the workspace it opens the first page when none is open, the neighbour (`lastEditorIndex`) when the open one is removed, and the empty state when the PDF has no pages;
- it re-renders when the page's signature (`editorSigOf`: tid, source page, rotation, crop) or its file's bytes changed, so Page actions and Fill form show at once.

`openEditor(item)` in the workspace keeps your tool and zoom; `closeEditor()` there never closes — Esc lets go of the selection, then of the tool. **`#editModal.open` now means "a page is bound"** in both modes; the keyboard rules use `modalIsOpen()`, which does not count the editor while it is part of the page, and the editor's own keys stand back when another modal is open or the event was already handled (`e.defaultPrevented`, e.g. Delete on a page card).

`renderEditor()` is safe to call again while it runs: `editorSeq` drops an overtaken render; the page is drawn off-screen and swapped in (no blank flash); `editorVp` is `null` while a *different* page is loading, so nothing can be placed with the old page's transform; in the workspace it dims the page (`#editCanvasWrap.loading`) instead of raising the full-screen "Rendering…" overlay.

**Page cards** (`renderTray`): number badge, ⋯ (`.card-menu` → the ONE floating `#pageMenu`, `openPageMenu` — the list scrolls, so a panel inside a card would be clipped), thumbnail, edit-count badge, ◀ ▶ (hidden in the workspace), caption. Plain click = open; Ctrl/Shift-click = multi-select (`pickedTray`, bar `#trayPickBar`); on touch, "Select" in the ⋯ menu starts a selection and further taps add to it. Keys on a card: Enter opens · ↑/↓ walk the list (workspace) · Alt+↑/↓ or ←/→ move the page · Delete removes. `trayInsertIndex(clientX, clientY)` handles both the grid (row first, then left/right half) and the single column (upper/lower half).

**Page pictures follow the edits.** A card shows the source thumbnail (rotation by CSS, `rotDelta`) until the page has stamps or a crop. Then `queueThumb` → `runThumbQueue` (450 ms debounce) bakes a picture: the page on screen via `editorThumb()` (instant), any other page via `bakeThumb()` → `buildPdfBytes`. `thumbRot` and `thumbKey` ride along in autosave and projects but are **left out of `historyKey`** (a new picture is not an undo step); `rememberThumb` patches the newest undo snapshot so undo/redo never brings back a stale picture. A page that loses its last stamp goes back to the source picture.

**Short screens** (under 600 px tall — a phone on its side): the whole left column scrolls instead of the list inside it, and the footer hides.

### Source files tab: selecting pages for the PDF

```js
pickedSrc     : Set<sid>     // source pages selected but not yet put in the PDF
lastPickedSid : sid | null   // anchor for shift-click ranges
```

Clicking a source page **selects** it; it does not add it. A sticky `#pickBar`
shows the count with Select all / Clear / **Use N selected pages**, which calls
`addPickedToTray()` → `trayAdd()` for each pick in on-screen order (document by
document, page by page), clears the selection, switches to the Pages tab and (in
the workspace) shows the first new page. Shift-click ranges within a document;
Enter/Space selects; **double-click adds that one page immediately** and stays on
the tab. (Source cards are still `draggable`, but the pages list is on the other
tab, so there is currently nowhere to drop them — a drop target on the page area
would be a small addition.)

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
| Delivery surface | `#btnPreviewFinal` → `previewFinal()` (the full finish dialog: `#savePreview`, `#previewEmail`, `#previewSms`, `#previewPrint`, `.finish-opts` mirroring the four checkboxes, `#previewSplit/Each/Zip`); the ⋯ menu `#wsMoreWrap` holds the real controls (`#btnCreate`, `#btnEmail`, `#btnSms`, `#btnPrint`, `#btnSplitRanges`, `#btnEachPage`, `#btnZipOutputs`, `#chkShrink/Numbers/Lock/Permanent`, `#btnClearTray`) — the dialog buttons just click them; badge `#optBadge` sits on `#btnWsMore` |
| Workspace shell | markup `.ws-bar`, `.ws-grid` > `.ws-left` + `#editModal`; `wsWide`, `wsMode()`, `setStep`, `updateWorkflowState`, `syncEditor`, `syncEditorAria`; CSS block "All-in-one workspace, October 2026" |
| Project chip / several new PDFs | `#docMenuWrap`: `#btnSaveProject`, `.doc-switch` + `#outputSelect` (shown when `body.multi-output`), `#btnNewOutput`, `#btnDuplicateOutput`, `#btnRemoveOutput`; label written in `renderOutputSelect` ("Draft", the project name, "· PDF 2 of 3") |
| Close / Start over | `#btnReset` handler ("Close this PDF?": `#saveAndClose`, `#confirmReset`, `#cancelReset`); `#btnWsBack`, `#navNew`, `#tabNew` all click it |
| Page actions, duplicate, blank page | `rotatePage`, `removePage`, `duplicatePage`, `addBlankPage` (`BLANK_NAME` — one reusable one-page source), `showPage`; buttons `#btnPageRotL/RotR/Dup/Remove`, `#btnBlankPage`, `#btnAddPages` (= the Combine intent) |
| Page pictures | `thumbKeyOf`, `thumbStale`, `queueThumb`, `runThumbQueue`, `editorThumb`, `bakeThumb`, `paintCard`, `rememberThumb` |
| Parsed-source cache | `loadSource`, `parsedSources` (above `buildPdfBytes`) |
| **Finish** | `finishProject(saveFn)`, `addFinishButton`, `refreshFinishNote` (`#finishNote`), `markDelivered(how, ids)` / `deliveredHow(id)` / `outputSig(id)` over the `delivered` Map (declared with the other state at the top of the script), `nextUnfinished`, `pruneFinished` (`FINISHED_KEEP`), `reopenProject`, `emptyWorkspace`; header slot `#studioDialogActions` (emptied by every `showDialog`) |
| Permanent white-out | `rasterizePages(bytes, indexes)`; wired in `buildFinalBytes` before numbering; option `permanent` in `exportOptions()` |
| OCR (tesseract.js, on demand) | `loadOCR`, editor `#btnOCR` dialog, bulk `#btnOcrAll`; `rememberOcr` → `doc.ocr[pageIndex]` → merged in `getDocTexts` |
| Packets + agency stamps | `sharedGet/sharedPut` (`/shared/<name>`), `renderPackets`, `openPacket`, `libraryDocsInOrder`, `tagLibraryDoc`; `loadSharedStamps`, `renderSharedStamps`, `shareStamp` |
| Initials | `sigKind` ('sig' \| 'ini'), `INI_KEY`, `setSigKind`; placement width `currentSigW` (60 vs 150 pt) |
| Editor page jump / tips | `jumpEditor`, `#editorPageJump`, PageUp/PageDown in the editor keydown; `HINTS_KEY` + `applyHintPref` |
| Gmail memory | `applyMailType` (type + file name → subject), `rememberRecipient`/`renderRecentTo` (`bliPdfRecentTo`, datalist `#mailToList`) |
| Auto-named PDF | `suggestName(base, force)` — called from `addPdfData`/`addImageData` (first file wins) and `openPacket` (force: overrides an auto name, never a typed one); `lastAutoName` |
| "Add every page (N)" | `#btnAddEverything` (Source files tab) and `#btnEmptyAddAll` (the empty page area), `sourcePageTotal`; visibility in `updateWorkflowState`; skips pages already in the tray |
| Status chips → setup | `#formsConnection` → `openFormsModal`, `#mailConnection` → Connections dialog (`#btnConnections` now lives in the source ⋯ menu) |
| Ctrl+S / Ctrl+P | document keydown after `modalNames`; guarded by dialog/modal open |
| Compact chrome | `body.home2.has-files` rules on `header.app-header` (mark first, then name) and `.ws-bar`; phone: icon-only header buttons (`font-size:0` + aria-labels), only `.workflow-step.current strong` shown; short windows tighten further (`max-height: 820px`) |
| Dialog language | `.form-card`/`.form-head`/`.form-body` restyled to match `dialog#studioDialog`; `button.dialog-close` on every close button; phone bottom sheet for both |
| Smoke test | `tools/pdf-studio-tests/smoke.js` (+ `tools/test-pdf-studio.bat`); hooks it relies on are listed at the end of the script under `window.PDFStudio` |
| Autosave (bytes once) | `storeDocBytes`, `bytesGet`, `bytesTx`, `savedBytes` (WeakSet of byte arrays); IndexedDB v4 store `docbytes`; records carry `stored:true` and `bytes:null`; `btnRestore` falls back to inline bytes for older records |
| Several pages at once | `pickedTray`, `togglePickTray`, `paintPickTray`, `clearTrayPicks`, `rotatePickedTray`, `removePickedTray`, `#trayPickBar`; Ctrl/Shift-click on a card, or "Select" in its ⋯ menu on touch |
| Menus that always fit | `wireMenu`: `flip`/`unflip` sideways, `upward` when it fits above, else `style.maxHeight` capped to the space below + scroll |
| Version stamp | `APP_VERSION` (top of script), `#appVersion` in the footer, `body[data-version]`, `PDFStudio.version` |
| Office undo | `sharedRestore(name)` → `POST /shared/<name>/restore`; `#btnPacketsUndo`, `#btnStampsUndo` |
| Help | `openHelp()`, `#btnHelp` (header), `#linkHelp` (landing) |
| Recent projects | `renderRecentProjects()` — landing only, last three from `bliPdfProjects`; refreshed by `saveProject`, project delete and `restoreWorkspace` |
| Find highlight in the viewer | inside `renderViewer`: `pdfjsLib.Util.transform(vp.transform, item.transform)` → yellow rects; title shows the match count |
| Home screen (Oct 2026) | markup `#homeView` inside `#sourcePane`: `.home-title`, `.intent-grid` (`#intentEdit`, `#intentCombine`, `#btnForms2`), `#dropzone`, `#recentProjects`, `#linkHelp` (the strip); CSS block "Home screen, October 2026" scoped under `body.home2` |
| Intents | `pickFiles(intent)`, `pendingIntent`, `runIntent(intent, before)` — in the `fileInput` change handler; `cancel` clears a stale intent |
| App navigation | `.app-shell` > `aside.app-nav` (`#navNew`, `#navProjects`, `#navForms`, `#navVersion`) + `<main>`; `nav#tabBar` (`#tabNew`, `#tabProjects`, `#tabForms`, `#tabHelp`); `#btnAvatar` → Connections |
| Recent project cards | `renderRecentProjects()` → `projectCard(pr)` (first page thumb from the saved snapshot, ⋮ menu: Open / Delete) |
| Finish dialog | see "Delivery surface" above; `previewFinal(true)` is the smaller review opened from the Gmail window |
| Page cards, ◀▶ reorder, the ⋯ menu | `renderTray`, `openPageMenu` / `#pageMenu`, `trayInsertIndex` |
| **Build engine** | `drawStamps` (~1892), `buildPdfBytes` (~1947) |
| Editor shell, tools, zoom | `TOOL_META` / `TOOL_IDS`, `setEditorMode`, `syncToolOptions`, `restMode`, `setEditorZoom` (`#zoomPct`), `openEditor`, `closeEditor`, `paintCurrentCard`, `syncEditor`, `renderEditor` |
| Stamp elements (drag/resize/edit) | `buildStampEl`, `startDrag`, `startResize`, `startTextEdit` (~2170–2280) |
| Pen + highlighter | `drawInkOn`, `redrawInk`, pointer handlers, marquee `mouseup` (~2290–2420) |
| Crop (pending → confirm) | `showPendingCrop`, `applyCrop` (the card picture follows through `queueThumb`) |
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
- **Permanent white-out** (ON by default) — `rasterizePages` in `buildFinalBytes`, before page numbers: each page whose stamps include a `box` is rendered by pdf.js (≤2400 px), re-embedded as a JPEG page of the same size, and the original page removed, so the covered text leaves the file. Other pages are untouched. Applies to Save, Preview, Gmail, SMS, Print and ZIP. With it off, white-out merely hides (never call that redaction).

## 7. Storage map

**IndexedDB `bliPdfStudio` (v4)**

| Store | Key | Contents |
|---|---|---|
| *(db `bliPdfProjects`)* `projects` | project id | Named projects and finished jobs: `{id, name, when, data}` plus, when Finish saved it, `finishedAt` and `auto` (`auto:true` = Finish created it unnamed; only the newest 12 of those are kept). Saving through Projects or "Save project & close" writes the record without them, so a named project is never pruned. |
| `session` | `current` | Auto-saved workspace: documents (bytes live in `docbytes`), tray with stamps, crops, card pictures (`thumb`, `thumbRot`, `thumbKey`), file name. Debounced 1.2s via `scheduleAutosave()`; offered back by `offerRestore()`. The tray is written with an **explicit field list** — a new per-page field must be added there and in `offerRestore`. |
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
- Auth: `x-forms-code` header (or `?code=`) vs the `FORMS_CODE` secret. **The code itself is deliberately not written in this file** — see the warning at the top. Rotate from Git Bash — PowerShell pipes prepend a BOM:
  ```bash
  printf 'new-code' | npx wrangler secret put FORMS_CODE
  ```
- API: `GET /list` · `GET|DELETE /file/<key>` · `POST /upload` (body = bytes, headers `x-name` urlencoded, `x-pages`; 30 MB cap) · `POST /rename/<key>` (`x-name`) · **`GET|PUT|DELETE /shared/<name>`** — small agency-wide JSON documents stored at `_shared/<name>.json` (hidden from `/list`, 2 MB cap): `packets` and `stamps`. Same access code; never customer data. Every PUT keeps the version it replaces at `_shared/<name>.prev.json`; **`GET /shared/<name>/previous`** reads it and **`POST /shared/<name>/restore`** swaps current and previous (the office's one-step undo). DELETE removes both.
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
| 16 | Highlight and crop **hide** content — the text is still in the file. White-out removes it only because **Permanent white-out** is on by default; with it off, white-out hides too | Permanent white-out re-saves only the pages that carry a white-out as pictures. Never call the OFF state a redaction, and never quietly change the default |
| 17 | Re-rendering a list inside a click handler kills the following `dblclick` (the element it fired on is gone) and scrolls the user's place away | Repaint in place — see `paintPick()` in §3 |
| 18 | **Stamps drawn over a fillable form field vanish from the saved/printed file** while the editor preview looks right — widgets are annotations and annotations paint ON TOP of page content | `buildPdfBytes` flattens the source form when any stamp/crop exists, then deletes the leftover `/Annots` on the copied page. Untouched forms stay fillable. Never "fix" this by drawing stamps earlier — order can't beat an annotation |
| 19 | Two contributors edit `pdf-tools/index.html` (Claude here, Bill + Codex on GitHub) | **`git fetch` and check `HEAD..origin/main` before editing**; Codex works in worktrees under `Playground\`, never hand-delete one (`git worktree remove`, and its files are owned by the `CodexSandboxOffline` account so `takeown` is needed) |
| 20 | A `.menu-panel` anchored by CSS (`right:0`) lands off-screen the moment its button sits in a different grid column or the tray moves to the top of the page | `wireMenu` measures the panel when it opens and adds `flip` (right-anchored) or `unflip` (left-anchored); Step 3 panels open **downward** (no `up` class) because the tray header is at the top now |
| 21 | *(retired with `.output-actions`, Oct 2026)* Codex's mobile CSS reset `.save-button` to `grid-column:auto`, so Save stopped spanning the phone row | — |
| 22 | pdf.js `annotationMode: 2` (ENABLE_FORMS) does **not** paint form widgets onto the canvas | When testing whether something is visually covered, render with the default mode |
| 23 | `tagLibraryDoc` tags the **last** document in `docs` after `addPdfData` | It checks the name matches and no key is set; if `addPdfData` ever becomes concurrent, return the docId from it instead |
| 24 | Shared stamps and packets are agency-wide behind ONE code; signatures/initials are deliberately per device | Do not "complete the feature" by sharing signatures — that would let anyone apply anyone's signature |
| 25 | Codex's phone CSS gives `.workflow-step` `flex:1` and `.device-status` `width:100%` — any attempt to put the steps and a chip on one row silently fails | Override both (`flex:0 0 auto`, `width:auto`) under `body.has-files`; measure with `getBoundingClientRect`, never assume |
| 26 | There are two dialog systems (`.form-card` modals and `dialog#studioDialog`). They now LOOK the same; they are still two code paths | New dialogs: use `showDialog(title, html)`; when touching an old modal keep `button.dialog-close` and the bottom-sheet rules |
| 27 | `suggestName` tags the PDF after the first file only; the packet path uses `force`. If a future feature renames PDFs automatically, respect `lastAutoName` so typed names are never overwritten | See §14 Phase D |
| 28 | Flipping a menu sideways is not enough on a phone — the tall Settings panel ran off the bottom | `wireMenu` also adds `upward` when the panel fits above, otherwise caps `style.maxHeight` to the space below and lets it scroll. The smoke test checks all three panels on 375×812 |
| 29 | Autosave records are now `stored:true` with `bytes:null`; putting bytes back inline would silently double storage again | Read bytes with `bytesGet(docId)`; `savedBytes` is keyed by the byte ARRAY, so a re-created document with a reused id is written again (correct) |
| 30 | In the smoke test every `evalIn` block returns a fresh `r`; a check inserted between a block and its assertions reads the wrong result (this bit the author once) | Keep each block's `ok(...)` lines directly under it |
| 31 | *(retired with `.output-actions`, Oct 2026)* A rule in the `@media (max-width:1180px)` block turned every non-Save action into a 42 px icon-only button | — |
| 32 | New CSS loses to two older generations of header/landing rules, and `body.has-files` compact rules have the same specificity as `body.home2` ones | Landing-only sizes are written `body.home2:not(.has-files) …`; shared look is `body.home2 …`. Keep that split or the compact header regresses |
| 33 | Other sessions (Bill + Codex, other chats) work in this folder at the same time — `git status` can show a dozen files that are not yours, and the nav pre-push hook reads the working tree | Stage by explicit path only; never `git add -A`; if the hook blocks on someone else's in-progress `tools/nav.json`, stash that one file, push, pop |
| 34 | Inline shell heredocs over ~9 KB fail with "unexpected EOF" in this environment | Write patch scripts to a file and run them |
| 35 | Inside the script `history` is the **undo stack** (`let history = []`), so `history.replaceState(...)` threw "not a function". It ran only when arriving by the phone-setup link (`#gw=…`) — and killed the rest of start-up, leaving a dead page on the phone | `window.history.replaceState`. Smoke check 10b loads the app with a `#gw=` link. Any browser global shadowed by a local needs the `window.` prefix |
| 36 | The global reset `* { margin: 0 }` removes the browser's `margin: auto` from `<dialog>`, so every studio dialog sat in the top-left corner on desktop | `dialog#studioDialog { margin: auto }` at ≥ 601 px (phones keep the bottom sheet) |
| 37 | The general `button` rule (`min-height: 38px`, padding) and `button:hover:not(:disabled)` (lift + shadow, specificity 0,2,1) hit **every** button — the 20 px delete handle on a selected item was drawn as a tall red pill | Small or flat buttons must reset `min-height`/`padding`, and cancel the lift with a `body.home2 …:hover` rule (a bare `.class:hover` loses) |
| 38 | Rules from the retired shelf still match by id: `#projectLabel{display:none}` (≤ 600 px), `body:not(.step-3):not(.multi-output) #btnNewOutput{display:none}`, `#btnEditMore{width:100% !important}` (≤ 600 px) | Overridden with more specific rules in the workspace block. If one of those elements "disappears", check its computed style before anything else |
| 39 | In the workspace the editor never closes, so "is the editor open?" no longer means "a layer is on top" | Ctrl+S / the Tab trap use `modalIsOpen()`; the editor's keydown handler returns when another modal is open or `e.defaultPrevented` |
| 40 | Anything that replaces tray objects (undo, `switchOutput`, opening a project) leaves `editorItem` pointing at a dead object — edits would go nowhere | `syncEditor()` after every `renderAll()` re-binds by `tid`. Never cache a tray item anywhere else |
| 41 | A forced line break in a wrapping flex row (`::after { flex-basis: 100% }`) is a line of its own, so the row gap is applied twice | `.ws-bar` and `.ed-bar` use `gap: 4px 8px` / `3px 6px` where they wrap |
| 42 | Playwright's `dragTo` scrolls the target into view between press and move; Chrome picks the dragged element by hit-testing the press point when the drag *starts*, so a different card gets dragged | In tests keep both cards in view (`scrollTop = 0`, neighbours). It is not an app bug |
| 43 | `thumbRot` / `thumbKey` on tray items | Keep them in the autosave field lists and OUT of `historyKey`; `rebuildThumbs` (form fill) resets them |
| 44 | A text box on the page is `contenteditable="plaintext-only"`, so the selector `[contenteditable=true]` does not match it — the Ctrl+Z handler took the keystroke and undid the workspace mid-typing | Test `el.isContentEditable`, never the attribute value |
| 45 | `renderAll()` rebuilds both lists. Their scroll positions survive only because nothing reads layout between the clear and the rebuild — and `scrollIntoView` on the current card after every render threw a long list back to the page on screen | Scroll the current card into view only when the page on screen *changes* (`openEditor`), never from `syncEditor`'s "nothing changed" branch; do not add layout reads (`offsetHeight`, `getBoundingClientRect`) inside `renderSources` / `renderTray` |
| 46 | Finish must not save twice: a PDF already saved, put in a Gmail draft, handed to SMS, printed or zipped *as it stands* is "delivered" | Every delivery path calls `markDelivered(how, ids)`, which stores `outputSig(id)` — name, finish options, file sizes and the pages minus their pictures. Any later change makes the signature differ, so Finish saves again. `restoreWorkspace` clears the map when the files change identity (a different job), not on undo/redo. A new delivery path must call `markDelivered` |
| 47 | A Preview & finish rebuild (an option ticked) that was still running when the window was closed reopened it — `showDialog` calls `showModal()` | `previewFinal` drops overtaken builds (`previewSeq`) and, for a rebuild (`focusOpt`), returns when the dialog is no longer the open Preview & finish. Options, Save PDF and Finish are disabled until the new PDF is built, so nothing saves the old one |
| 48 | The autosave remembered written file bytes in a WeakSet of arrays. Close (which empties the byte store) then Ctrl+Z brought back the SAME arrays, so they were never written again — "Saved at…", yet a later Restore lost every page | `storedBytes` is a `Map<docId, bytes>` of what is really in the store; `sessionDel` clears it, pruning deletes from it |
| 49 | Clicking a page card focuses it (`tabindex=0`), and pointerdowns on the page are default-prevented, so focus stayed on the card: Delete with an item selected removed the PAGE, and ←/→ reordered it | The card's keydown yields Delete to a selected item and does nothing behind the full-screen editor; a capture-phase pointerdown on `#editCanvasWrap` blurs a focused card. In the workspace column only Alt+↑/↓ move a page |
| 50 | The full-screen editor's "Rendering page…" overlay stayed up when a workspace render (no overlay) overtook it after the window widened | `editorBusy` remembers that renderEditor raised it; whichever render finishes last lowers it |

## 11. Extending it safely

**Run the smoke test before you push:** `tools\test-pdf-studio.bat` (55 checks — 57 with the Forms host — about two and a half minutes, drives the Chrome or Edge already on the PC through `window.PDFStudio`; `set FORMS_CODE=…` first to include the Forms-host checks, `set PDF_STUDIO_URL=https://www.billlayneinsurance.com/pdf-tools/` to test the live site). Add a check when you add a feature — `tools/pdf-studio-tests/smoke.js`, one `evalIn` block per feature, each block returns its own `r`. Bump `APP_VERSION` at the top of the script on every release.

**Look at it, too:** `node tools/pdf-studio-tests/shots.js` writes desktop (1586×992), laptop (1366×768), tablet (820×1100) and phone (390×844) screenshots — home, the workspace with and without pages, an edit, the Source files tab, Preview & finish, and on the narrow sizes the page grid and the full-screen editor — into `tools/pdf-studio-tests/shots/` (git-ignored). Read the PNGs. Numbers alone missed five visible defects in the home redesign and five more in the workspace (cards not filling their column, a clipped hint, the delete handle as a pill, dialogs in the corner, footer chips over the page count).

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
   window.PDFStudio.getState()                // {docs, tray (stamps, crop, baked), current, tool, loading, ws, step}
   window.PDFStudio.formsAdd / formsList
   ```
   `current` = index of the page on screen (−1 = none), `loading` = the editor is still drawing it, `ws` = the three-pane workspace is active, `tray[i].baked` = that card's picture matches the page as it stands. The smoke test's `shown(i)` helper waits on `current` + `loading`.
   Typical check: build a synthetic PDF with pdf-lib in the page, drive the UI, then re-open the output with pdf.js and assert on extracted text / page sizes / rotations.
4. **Verify, then deploy:** local preview is `python -m http.server 8080` (launch.json entry `dev`) at `http://localhost:8080/pdf-tools/`. Push, then poll the live URL for a string from the new code before declaring it live.
5. **Keep it one file.** The single-file constraint is a feature: no build step, trivially portable, and staff can't get a half-loaded app.

## 12. Related memory / docs

- `mail-gateway/HANDOFF-*.md` — the three email-layer handoffs (gateway, attachments, styled body).
- Claude memory: `project_pdf_studio.md` (full build history, decisions, dated entries) and `project_bli_form_host.md`.
- Related agency tooling that could reuse these patterns: Quote Template Studio, Letterhead PDF Generator, Card Generator.

## 13. Premium staff interface (August 2026)

> **Layout superseded twice since** — the home screen and the all-in-one workspace (§3, §14 rounds four and five). What still holds from this section: the system-font rule, the colour roles (blue = action/selection, gold = "you're finished", red = destructive), the 3 px focus rings, and the safety boundary. What no longer holds: the dark editor and its left tool rail (the editor is light, the tools are a grid on the right), the bottom "finishing dock", and the tray keys (now: Enter opens · ↑/↓ walk · Alt+↑/↓ or ←/→ move · Delete removes).

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

> Update 2026-09-20: **gold means "you're finished"** — Save PDF (Step 3) and Done (editor) are gold; blue remains selection/progress (pick bar, selected cards); navy is the ordinary `.primary`. Dialogs share one look (see §14 Phase E).

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
- **Permanent white-out** (`chkPermanent`, `exportOptions().permanent`) — **ON by default** (Bill's call, 2026-09-20): `restoreExtras` treats a missing key as on and only an explicit `false` as off, so pre-existing autosaves/projects come back protected; `updateOptBadge` counts deviations from the defaults, so the badge appears when protection is turned OFF. In `buildFinalBytes`, before page numbers, every list item with a `box` stamp is rasterized by `rasterizePages` (pdf.js render ≤2400 px → JPEG 0.88 → `insertPage(i)` + `removePage(i+1)`), so the covered text leaves the file. Verified: the page has zero text items and a white pixel under the box; other pages untouched. Editor white-out hint points to it.
- **OCR feeds Find**: `rememberOcr` stores `doc.ocr[pageIndex]`, invalidates `docTextCache`; `getDocTexts` merges it (image docs become searchable too). Bulk "Read scanned pages (OCR)" in the ⋯ source menu reads every page with <20 chars of text, with progress + Stop. `ocr` rides along in autosave/restore/projects.
- **Stamp every page** checkbox in the stamp panel: `placeCenteredText` copies the stamp to every other tray item (same coordinates).
- **Initials**: second saved list (`bliPdfStudioInitials`), toggle in the signature panel, placed at 60 pt wide.
- **Gmail memory**: subject = type default + file name (kept when the user typed their own — `lastAutoSubject`); last 10 recipients in a datalist.

### Phase C — agency-wide extras (commit 7dc6fbf; Worker commits 75f24dd, e02aa12)
- Forms host: `GET|PUT|DELETE /shared/<name>` (see §8).
- **Packets** in the Forms Library modal (`#packetsBox`): "Save current forms as a packet" takes the library docs in the workspace (ordered by first appearance in the tray — `libraryDocsInOrder`) plus reminders; "Open packet" loads each form, tags it, places every page in Step 3 in packet order, then lists reminders/missing forms in a dialog. Library docs carry `libKey`/`libName` (autosaved).
- **Agency stamps** in the stamp panel (`#sharedStamps`): ↑ on a local text/picture chip shares it; shared chips have a dashed ring and a two-click remove. 5-minute cache. Signatures stay local (gotcha 24).

### Phase D — quick flow wins (commit d75444e)
- **Auto-named PDF**: `suggestName` runs after every `addPdfData`/`addImageData` — the first file names the PDF (extension and illegal characters stripped, 80 chars); later files never rename it; `openPacket` renames only an auto-set name (`force`). A typed name is never touched.
- **Add every page (N)** in the Step 2 header: everything in file order into Step 3, skipping pages already there; hidden on Step 3 and when nothing is left to add.
- **Status chips are buttons**: Forms → Forms Library modal (code entry lives there), Gmail → Connections dialog. `#btnConnections` moved into the source ⋯ menu (`updateConnectionStatus` writes `lastChild.textContent`, which still works on a `<button>`).
- **Ctrl+S / Ctrl+P** on Step 3 (jumps to Step 3 first; ignored while the editor or any dialog is open; toast when the tray is empty).
- **Gold = "you're finished"**: `.output-actions .save-button.primary` is `var(--gold)` to match the editor's Done and the website's gold-CTA rule; the pick bar's "Add N to Step 3" stays blue (progress, not finish).
- Remove file is inside a per-file ⋯ menu (built in `renderSources`, same flip/unflip logic as `wireMenu`); Projects has an icon.

### Phase E — one dialog language (commit with F)
CSS only: the six older modals (`.form-card`) adopt `dialog#studioDialog`'s look — 16 px radius, `#cbd5e1` border, `#0b1e38a6` backdrop, white 20 px title (18 px on phones for both), `.form-body` 18/20 px padding — and every close button is `button.dialog-close` reading "✕ Close" (eight of them, including the editor's stamp and signature panels and `#studioDialogClose`). Phones: the older modals become bottom sheets (`align-items:flex-end`, `100vw`, `96dvh`, top radius only) exactly like the studio dialog.

### Phase F — the header gets out of the way (commit with E)
`body.has-files` shrinks `header.app-header` (tagline and brand subtitle hidden, 16 px h1, 30 px buttons) and `.workflow-shell` (24 px circles, step captions hidden). Measured at 1366×768: 147 → 100 px above the work. Phones (375): 179 → 92 px — header buttons icon-only (`font-size:0`, icons 18 px, `aria-label`s), `.brand::after` suffix off, only the current step's label shown, steps `flex:0 0 auto` and `.device-status{width:auto}` so the autosave chip shares the row (Codex's mobile CSS had `.workflow-step{flex:1}` and `.device-status{width:100%}`, which forced two rows). Autosave label is "Saving…" — "on this device" is already in the header chip. Step 3 pages on a phone: 22 % → 47 % of the screen across the day.

### Round three — reliability, speed, adoption (commits ed800d6, 45dc6cf, and the items 4–8 commit)
1. **Smoke test** — see §11. 29 checks, phone and desktop, including an autosave round trip across a reload and (with `FORMS_CODE`) packets and agency stamps against the live host, cleaning up after itself.
2. **Autosave writes file bytes once.** `bliPdfStudio` is v4 with a `docbytes` store; `storeDocBytes()` writes each file's bytes the first time it sees that byte array (WeakSet), prunes bytes for files no longer loaded, and the per-change record carries only the light state. A 30 MB scan packet no longer re-writes itself after every edit. `sessionDel` clears both. Older records with inline bytes still restore.
3. **Step 3 multi-select** — click cards (not their buttons) to select, shift-click a range; the bar rotates or removes the selection (with Undo); Delete on a selected card removes the whole selection.
4. **Version stamp** — `APP_VERSION`; "which version are you on?" is answered by the footer or the Help dialog.
5. **Office-wide undo** for packets and agency stamps (Worker keeps the previous version; see §8).
6. **Help** — six-point "How PDF Studio works" + keys, from the header and the landing page.
7. **Recent projects** — the last three named projects as one-click chips on the landing page.
8. **Find highlight** — the zoom viewer paints matched words and counts them in its title.
Also: menus cap their height to the space below when neither sideways nor upward flipping fits (the phone Settings panel).

### Round four — the home screen (2026-10-01)
Built to Bill's desktop and mobile mockups ("What would you like to do?").
- **Home view** replaces the old landing card: headline, three intent cards, dashed drop area with a blue *Choose Files*, recent projects as cards, the "simpler way" strip (opens Help). No stepper, no footer and no card chrome around `#sourcePane` on the landing.
- **Intents.** *Edit a PDF* → picker → every page of the picked files into the tray → `setStep(3)` → editor on the first new page. *Combine Files* → same without the editor. *Start with a Form* → Forms Library. The plain drop area / Choose Files / drag-and-drop keep the choose-pages flow.
- **Navigation.** Desktop sidebar (New PDF · Recent Projects · Forms Library, brand + version at the foot); it is a 64 px icon rail when `body.has-files` and at every width ≤ 1180 px; hidden ≤ 860 px, where the **landing** shows a bottom tab bar (New PDF · Projects · Forms · Help). New PDF with work open → the Start-over dialog. The gold **BL** mark opens Connections (it is a device mark, not an account).
- **Stages renamed** to the strip — see the note under "Full-page steps".
- **Recent projects are real** (the mockup's "Sample projects" were placeholders): last three from `bliPdfProjects`, or a one-line empty state.
- **No web font.** The mockup's typeface would be a new third-party request; headings use the system stack at weight 700 (800 renders as Segoe "Black" — too heavy).
- Found by looking at screenshots and fixed: sidebar labels centered by the global `button{justify-content:center}`; the file-types line off-center (old `max-width:560px; margin:0 auto` lost its auto margins); *Back to pages* stretching across the heading column and its focus ring covering the hint; action buttons 42 px wide on phones.

### Round five — the all-in-one workspace (2026-10-01, v2026-10-01.2)
Built to Bill's third mockup ("easier to work a document and see and add"). Structure and rules are in §3; this is what changed and why.
- **One screen** at ≥ 1024 px once a file is open: Pages | Source files on the left, the live page in the middle, tools + options + Page actions on the right. The pop-up editor is gone there — selecting a page *is* opening it. Narrower screens keep one pane at a time and a full-screen editor, with the same top bar and tabs.
- **One finishing action**, *Preview & finish* (blue, as in the mockup); gold *Save PDF* is the first button inside it. Save / Gmail / SMS / Print / exports / the four options also live in the ⋯ menu beside it for staff who do not want the preview.
- **Removed:** the output shelf, the Step 3 header with Send ▾ / Export ▾ / Settings, "Back to pages" / "Your PDF (N)", the four buttons on each page card, the icon rail while working, the header privacy chip (now the footer's first item).
- **New:** Select tool; Duplicate page; Add blank page; a ⋯ menu on every page; zoom %; page pictures that follow the edits; "Close this PDF?" with *Save project & close*; files dropped while the Pages tab is showing join the PDF; opening a project or restoring autosave lands on its pages; the project chip ("Draft" / project name / "· PDF 2 of 3").
- **Not built, on purpose:** the mockup's *Shapes* tool and its font / bold / italic / alignment row — the engine has none of them, and a control that does nothing is worse than no control. The tiles show the real tools instead (White-out, Signature, Stamps, Crop). Both are reasonable next features: shapes would be a new stamp kind (`drawStamps` + `editorThumb` + `buildStampEl`); bold/italic would pick `HelveticaBold` / `Oblique` per text stamp.
- **Found on the way and fixed:** the phone-setup link (`#gw=…`) crashed start-up (gotcha 35) — broken since the 2026-09-07 release that added the undo stack; studio dialogs sat in the top-left corner on desktop (36); the delete handle on a selected item was a tall pill (37); the source pick bar had white text on pale blue; Ctrl+Z while typing in a text box on the page undid the whole workspace (44).
- **Preview & finish** shows the whole page (`.studio-preview canvas { max-height }`); click the page to zoom to full size and back.
- **Speed:** `loadSource` reuses parsed sources (a 40 MB, 40-page scan packet: about 0.25 s per page switch, nearly all of it pdf.js drawing the scan). A shared `pdfjsLib.PDFWorker` for the editor would be the next step if that ever feels slow.
- **Left for later:** about 14 KB of now-dead CSS — some 150 rules whose selectors name the retired classes (the list is in the comment that opens the workspace block); prune it in a commit of its own and compare screenshots before and after; a drop target so source pages can be dragged onto the page area.

### Round six — Finish, and the review fixes (2026-10-01, v2026-10-01.3)
Bill: "once I get to Preview and finish, there should be a Finish action button in the header so I can click and it finishes the project."
- **Finish** — gold (gold = "you're finished"), in the Preview & finish header beside Close. It saves the PDF *unless it already left the app as it stands* (gotcha 46), then: if another new PDF of the project is still waiting it opens that one; otherwise it keeps the project under Recent projects and closes it, with a 7-second **Reopen**. A note under the summary always says what Finish will do. Save PDF inside the dialog became a plain button (save a copy and keep working); Finish is the one gold action.
- Finish also appears in the Gmail window's success message and in the SMS dialog once the PDF was handed over — those deliveries count, so Finish there only closes.
- **Retention:** a job Finish saves without a name is `auto:true`; the newest 12 of those are kept, older ones are deleted. Named projects are never pruned. (Bill was told; change `FINISHED_KEEP` if he wants more, fewer or none.)
- **Independent review** of the workspace release (a fresh agent, reading the diff and driving the page) found five real defects, all fixed and now covered by the smoke test: Delete removing the page instead of the selected item (49), the stuck "Rendering page…" overlay (50), the Preview & finish rebuild race (47), the autosave losing file bytes after Close → Ctrl+Z (48), and two quick clicks on Add blank page failing (now chained, `addPdfData` returns its doc id). Also: no card picture is taken while a marquee or pen stroke is mid-drag; narrowing the window while typing in a text box no longer throws; Move page and a Ctrl-click selection do not survive crossing 1024 px.

### Storage added this session
localStorage `bliPdfHintsOff`, `bliPdfStudioInitials`, `bliPdfRecentTo`; doc fields `ocr`, `libKey`, `libName`; IndexedDB `bliPdfStudio` v4 store `docbytes` (file bytes, keyed by docId); R2 `_shared/packets.json`, `_shared/stamps.json` and their `.prev.json` twins.

### Not done, on purpose
- Cloud projects (customer documents off-device) — would break the privacy promise that makes staff trust the tool.
- Reformatting Codex's one-line-per-feature block: semantics-preserving but it would bury their authorship in the diff; leave it until a real edit is needed there.

## 15. Integration release — 2026-09-07 (Codex's note)

Bill approved all PDF Studio review recommendations. Implemented and locally verified. Publishing authorized by Bill (push please); both main branches pushed. PDF branch `codex/pdf-studio-workflow`, commit `90e249c`, checkout `C:/Users/bill/OneDrive/Documents/Playground/pdf-studio-workflow`. Companion SMS branch `codex/pdf-studio-import`, commit `85aaa35`, checkout `C:/Users/bill/OneDrive/Documents/Playground/sms-pdf-studio-import`. SMS published first: Worker version ff8a1f4c-b740-4a65-b58e-c8017dfec83e. Website GitHub Pages run 34166401502 succeeded. Production PDF HTML matches commit 90e249c after line-ending normalization; production SMS serves index-Cjms5Fxj.js. Live PDF UI and Connections dialog checked at desktop/mobile widths without horizontal overflow. Existing browser recovery data preserved; no production customer upload, Gmail draft, or SMS send was performed. Read `C:/Users/bill/OneDrive/Documents/Playground/pdf-review-samples/INTEGRATION.md` for full scope, tests, limits, and release steps. One-file PDF architecture retained; original service-center work untouched.


