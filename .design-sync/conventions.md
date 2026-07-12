# How to build with BLI Social Studio

This DS produces **social media post graphics** (not app UI) for Bill Layne
Insurance Agency — Facebook, Instagram, and Google Business Profile.

## Non-negotiable structure

1. **Every graphic starts with `SocialCanvas`** and exactly one template
   inside it. The canvas renders true platform pixels and sets the scale
   model — inside it, `1em = 1% of canvas width`. Components render broken
   outside a canvas.
2. Default `format="portrait"` (1080×1350 — the 2026 default for IG **and**
   FB feed). Others: `square`, `story`, `landscape` (FB link), `gbp`
   (Google post — content auto-stays in the center 900×900), `cover`
   (FB cover — use `CoverBanner` with `padding="none"`).
3. On screen, fit posts with the `scale` prop (0.3–0.5); **exports must use
   `scale={1}` and `safeGuides={false}`**. `safeGuides={true}` shows platform
   crop zones while composing.
4. Pick a `background` (`gradient` | `navy` | `teal` | `cream` | `white` |
   `gold` | `photo`) and **let the canvas handle color**: dark canvases flip
   every child to white ink + light-gold accents automatically. Never
   hand-set text colors on components.

## Styling idiom

- **Props, not CSS classes.** There is no utility-class vocabulary (no
  Tailwind). The internal `bss-*` classes are private — compose the exported
  components instead.
- Your own layout glue = plain `<div>`s with inline styles **in `em` units**
  (`gap: '2.5em'`, `margin: 'auto 0'` to center). Inline atoms in a stack
  need `alignItems: 'flex-start'` or they stretch.
- Tokens live as CSS custom properties in `_ds_bundle.css` (`--bss-navy`
  #003f87, `--bss-gold` #c8a84e, `--bss-teal`, `--bss-cream`,
  `--bss-grad-hero`, fonts `--bss-font-display` Fraunces /
  `--bss-font-sans` Archivo). Reference them only for glue; components
  already use them.
- Emphasis: wrap ONE key phrase in `Highlight` (`marker` | `underline` |
  `circle`) inside a `Headline`. Keep headlines under ~8 words.

## Content rules (insurance compliance — always)

- Phone **336-835-1993**, site **BillLayneInsurance.com**, towns
  Elkin / Dobson / Surry County. Trust chips: "Independent since 2005".
- Never "will save" / "cheapest" / competitor bashing. Use "could save",
  "many drivers save".
- Offer/quote posts pass
  `finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"`
  (renders above the `LogoStrap`). Keep `showStrap` on for feed posts.
- Photos: real people/places only (never AI-generated people) via
  `background="photo" photoSrc={url}` + `PhotoPost`.

## Read before composing

`guidelines/docs/2026-social-playbook.md` (what performs),
`platform-specs.md` (sizes/safe zones), `content-pillars.md` (12 post
archetypes + hook formulas), `brand-voice-compliance.md` (voice). Per
component: `components/general/<Name>/<Name>.prompt.md`.

## Canonical example

```jsx
const { SocialCanvas, HeroPromoPost, Highlight } = window.BLISocialStudio;

<SocialCanvas format="portrait" background="gradient" scale={0.4}>
  <HeroPromoPost
    kicker="Free this month"
    headline={<>We’ll read your policy <Highlight>so you don’t have to.</Highlight></>}
    subline="Bring any auto or home policy — we’ll flag the gaps in plain English."
    ctaLabel="Call or text 336-835-1993"
    ctaIcon="phone"
    finePrint="Coverage subject to policy terms and underwriting. NC License #6571216"
  />
</SocialCanvas>
```

Carousels: `CarouselCoverSlide` → `CarouselTipSlide` × N (15–20 words each)
→ `CarouselCTASlide`, all in the same portrait canvas — one canvas per slide.
