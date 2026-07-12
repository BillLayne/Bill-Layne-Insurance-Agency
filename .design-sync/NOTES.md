# design-sync NOTES — bli-social-studio → "BLI Social Media Studio"

Repo-specific gotchas for future syncs. Read before re-running anything.

## What this DS is

- `bli-social-studio/` is a **social-media graphics design system** (post canvases + templates for Facebook/Instagram/Google Business Profile) authored in-repo on 2026-07-12 specifically for the Claude Design project `940b78f1-4afa-4aa8-860c-5c4f312a7de7` ("BLI Social Media Studio"). It is not used by the website itself.
- Scale model: `SocialCanvas` sets `font-size = canvasWidth/100`, so **1em = 1% of canvas width** in every component. Components are meaningless outside a SocialCanvas.

## Build

- `buildCmd`: `npm run build` (in `bli-social-studio/`) = `tsc` + `scripts/build-css.mjs` (concatenates `src/styles/tokens.css` + `components.css` → `dist/bli-social-studio.css`; tokens MUST come first).
- `cssEntry: dist/bli-social-studio.css` — tokens ship **inside** `_ds_bundle.css`. `tokensPkg`/`tokensGlob` are deliberately unused: the converter's `copyTokens` only reads from a separate node_modules package, and this DS defines its vars in its own compiled stylesheet instead. `tokens/` in the bundle is legitimately empty.
- Converter invocation (from repo root):
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./bli-social-studio/node_modules --entry ./bli-social-studio/dist/index.js --out ./ds-bundle`

## Environment

- **Playwright pin**: machine cache has `chromium-1228`/`chromium-1208` → install `playwright@1.61.1` (pins 1228) into `.ds-sync/`. Verified 2026-07-12. No browser download needed.
- Node 22.20.0 / npm 10.9.3. Repo lives under OneDrive — no file-lock issues observed with npm/tsc/esbuild/playwright this run.

## Source gotchas

- **SVG icons carry `fill="currentColor"` as an attribute** — an inherited CSS `fill` on a wrapper span loses to it. To recolor an icon, target the element: `.bss-stars__star svg { fill: var(--bss-accent-strong); }` (this exact bug shipped once in StarRating and is fixed; pill/chip icons *intentionally* follow text color).
- `background="white"` canvases are invisible against white preview sheets — previews use cream/navy/gradient instead.
- Fonts: Fraunces + Archivo woff2 copied from `@fontsource/*` (OFL) into `bli-social-studio/src/fonts/`, declared in `src/styles/fonts.css`, wired via `extraFonts`.

## Preview conventions (authored files in .design-sync/previews/)

- Every cell wraps in `<SocialCanvas … scale={…}>`: portrait 0.32, square 0.4, story 0.26, gbp 0.36, cover 0.28.
- Layout glue: `<div style={{ margin: 'auto 0' }}>` centers; flex column stacks with `gap` in **em**.
- Copy: phone 336-835-1993 · BillLayneInsurance.com · Elkin/Dobson/Surry County · "Independent since 2005". Compliance: "could save", never "will save"/"cheapest"; promo cells carry `finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"` (license number is the current site standard, 83 uses).

## Wave-1 fold (2026-07-12, all 25 components authored + graded good)

- **Preview glue in the canvas flex column**: inline atoms (CTAPill, ChipBadge, Kicker, PhoneCTA) stretch full-width unless the stack div has `alignItems: 'flex-start'` (or the atom is wrapped in a block div). `margin: 'auto'` wrapper centers both axes.
- **Single-story captures are ~852×652 usable** (900×700 minus padding, fullPage off) — multi-canvas rows must budget scale (5 squares at 0.15; 4-format row at 0.18/0.13/0.2). Wider clips silently.
- **Caption labels outside a canvas** need explicit `fontFamily: 'system-ui, sans-serif'` (card body default is serif; `inherit` renders Times).
- **Grading**: sheet cells ~345px — before failing anything subtle, crop-zoom the full-res per-cell PNG at `_screenshots/review/raw/general__<Name>__<Cell>.png` (two suspected star defects were sheet-scale antialiasing).
- **StatPost** number fill: gold gradient on dark canvases; source CSS now remaps it navy→teal on cream/white and deep-navy on gold (was invisible gold-on-gold before 2026-07-12 fix). Pair StatPost with dark canvases for the classic look.
- **CoverBanner**: default tagline shortened to "Auto · Home · Life — Elkin, NC" + tagline now ellipsizes (min-width:0 fix) — keep custom taglines under ~30 chars; right column is flex:none by design.
- **HoursUpdatePost.note** (ReactNode): wrap phone numbers in a nowrap span or they break mid-hyphen.
- **PhotoPost in story format**: bottom strap sits inside the story bottom UI zone — by design for static graphics; `showStrap={false}` for strict story-safe placement (documented in guidelines/platform-specs).
- **Teal Highlight** reads paler than gold on navy; on light canvases prefer gold.
- Tiny-by-design text (strap finePrint, safe-guide labels) is near the legibility floor at preview scales — fine at export scale 1.0.

## Known render warns

- (none — StarRating [RENDER_THIN] resolved by its authored preview; the 25× [GRID_OVERFLOW] warns from 2026-07-12 are resolved by `cardMode: "column"` overrides for every component and cannot re-fire for column cards)

## Re-sync risks (watch-list for the next run)

- **The review server locks `ds-bundle/`**: `http-serve.mjs` holding the dir makes `package-build`/`resync` die with `EBUSY: rmdir` on Windows. Stop it first: `Get-NetTCPConnection -LocalPort <port>` → `Stop-Process`.
- **Every component carries `cardMode: "column"`** in `cfg.overrides` (canvas previews are wider than grid cells by design). A NEW component needs its own entry or validate will flag `[GRID_OVERFLOW]`.
- **Agency facts are inlined in component defaults**: phone 336-835-1993, BillLayneInsurance.com, "Since 2005", NC License #6571216 (finePrint convention). If any change, update `bli-social-studio/src/components/*` defaults + `conventions.md` + guidelines.
- **Guidelines are a July 2026 trends snapshot** (platform specs, algorithm behavior, AI-fatigue stats). Re-verify around mid-2027; platform pixel specs live in `SocialCanvas.tsx` (`FORMATS`/`GUIDES`) + `docs/platform-specs.md` — change together.
- **Fonts are pinned copies** from @fontsource (OFL) in `src/fonts/` — they don't auto-update, which is desirable.
- Verified-state carry-forward comes from the uploaded `_ds_sync.json` (this machine's grades live in gitignored `.design-sync/.cache/`). Re-syncs: fetch the remote anchor per the skill's one-command block.
- Playwright pin (1.61.1 ↔ chromium-1228) will drift if the machine's browser cache is cleaned — re-check `%LOCALAPPDATA%\ms-playwright` before installing anything.
