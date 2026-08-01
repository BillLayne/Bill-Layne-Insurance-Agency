# Mode guide — which template, when

Every piece = one `ImageCanvas` (sets format) + one template. Pick by intent.

## PROMO — `FlyerPromo`
Offers, announcements, brand moments, "free policy review". Kicker → one big
`Highlight` headline → plain-English subline → 2–4 value points → phone-first CTA
(+ optional `QRBlock`). Works on feed, story, and 8.5×11 flyer. CTA stays
compliant ("Request a quote").

## EDUCATION — `ExplainerInfographic`
"What does liability cover?", "how a claim works", coverage 101. Title over 3–5
icon-led points, each one plain sentence. `markers="numbered"` for step-by-step.

## SALES / QUOTE — `QuoteCard`
Phone-first sales/quote card. The number is the hero. `lines` (coverage/value) and
`headlineFigure` appear ONLY with real supplied numbers; otherwise leave them off
for a clean "call or text for your quote" card. Always carries the `Disclaimer`.

## EDUCATION (stat) — `StatSpotlight`
One oversized number as the whole point. Real figures only; third-party stats need
a `source` line. Best centered on a dark/gradient canvas.

## EDUCATION (list) — `ChecklistSheet`
Save-and-share checklists: storm prep, moving, "what to photograph after a claim".
4–7 short items.

## EDUCATION (compare) — `ComparePanel`
Myth vs. fact, do vs. don't, option A/B. Two columns with check/× marks. Never
names or implies a competitor — compare ideas and coverage, not agencies.

## COLLAGE — `CollageBoard`
Intentional multi-panel storytelling: before/after, a day at the agency, a coverage
story in three beats. Each panel has a caption; the set reads as one narrative.
Layouts: `grid`, `feature` (one big + supporting), `strip`.

## YOUTUBE — `YouTubeThumbnail` (use `format="youtube"`)
High-CTR 16:9 for @ncautoandhome: 2–5 huge punch words (+ `Highlight`), optional
subject photo, topic chip, channel tag, optional corner stamp. Legible at small
size. Original editorial style — never a copy of another creator.

## CORPORATE — `CorporateCard`
About/welcome/thank-you/B2B/sponsorship. Calmer: more whitespace, quieter type, no
hard CTA. Best on `cream` or `white`. Optional portrait (e.g. Bill).

## UNDERWRITING / DOC — `UWDocSheet` (use `background="white"`, `grain={false}`)
Neutral evidence sheet: titled header + metadata, labeled photo grid with optional
`callout` (arrow/circle) markup and `redact` privacy bars, and a footer stating the
evidence-preservation rule. Metadata values only from real supplied data.
