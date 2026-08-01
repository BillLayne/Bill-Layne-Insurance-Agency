# Format & print specs

Set the format on `ImageCanvas`. It renders at true pixel size and drives the
scale model (1em = 1% of canvas width), so a template lays out correctly in any
format. Preview with `scale={…}`; export at `scale={1}`.

| Format | Pixels | Aspect | Use |
|---|---|---|---|
| `feed45` | 1080 × 1350 | 4:5 | Instagram / Facebook feed (default social) |
| `square` | 1080 × 1080 | 1:1 | square posts, avatars, versatile |
| `story` | 1080 × 1920 | 9:16 | IG/FB Stories + Reels |
| `youtube` | 1280 × 720 | 16:9 | YouTube thumbnails (@ncautoandhome) |
| `header` | 1640 × 864 | ~1.9:1 | blog headers, email headers, OG/link images |
| `flyer` | 1275 × 1650 | 8.5×11 | print flyers/handouts — export at 2× for 300 ppi |

## Safe zones

Turn on `safeGuides` while composing (never on export):
- `story`: keep text out of the top 250px (profile) and bottom 380px (caption/UI).
- `youtube`: keep the punch words clear of the bottom-right timestamp corner.
- `header`: platforms crop the sides — keep the essential content centered.
- `flyer`: keep content inside the 0.5in print margin; don't rely on edge bleed.

## Export

- Social: PNG at `scale={1}` (true pixels above).
- Print flyer: export the `flyer` canvas at 2× (2550 × 3300 = 300 ppi at 8.5×11).
- Turn `safeGuides` OFF and, for documentation sheets, `grain` OFF before export.

## Legibility floor

On-image body text should not fall below ~1.4em (strap fine print / UW notes sit
near this floor by design — fine at export scale, tight in small previews). Keep
headlines ≤ ~8 words so they read at thumbnail size.
