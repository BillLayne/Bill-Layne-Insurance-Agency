# Platform Specs (2026)

Every `SocialCanvas format` maps to a current platform spec. Safe zones below
are drawn by `safeGuides` — use while composing, disable before export.

| Canvas `format` | Pixels | Ratio | Used for | Safe area |
|---|---|---|---|---|
| `portrait` (DEFAULT) | 1080×1350 | 4:5 | IG + FB feed, all carousel slides | Keep key content off edges — IG grid crops thumbnails to 3:4 |
| `square` | 1080×1080 | 1:1 | Secondary feed / GBP-friendly | Grid crop trims ~135px each side — center content |
| `story` | 1080×1920 | 9:16 | IG/FB Stories, Reels covers | ~250px clear at top, ~380px at bottom, 60px sides (platform UI) |
| `landscape` | 1200×630 | 1.91:1 | FB link/OG image | 40px inset |
| `gbp` | 1200×900 | 4:3 | Google Business Profile posts | **Everything inside the central 900×900** — GBP crops unpredictably, often square |
| `cover` | 1640×624 | — | Facebook cover photo (2× upload) | **Central 1280px only** — phones crop ~180px per side; use `CoverBanner` |

## Google Business Profile notes

- Post types: **Update** (fades after ~7 days), **Offer** and **Event** (persist to end date). Post 1–2×/week.
- Title limit 58 characters (Offers/Events); only the first ~250 characters of the body show pre-click — front-load.
- Google manually reviews images (24–48h) — schedule ahead of holidays.
- GBP posts feed local SEO: mention “Elkin NC”, “Surry County”, service keywords naturally.

## Story-format note

In `format="story"`, a bottom-pinned `LogoStrap` sits inside the platform's
bottom UI zone (~380px). For Stories, either set `showStrap={false}` (your
profile name already brands the story) or accept that the strap is decorative
under the platform UI. Keep real CTAs inside the dashed story-safe zone.

## Production tip

Design the 4:5 portrait master first with the message block also surviving a
centered 1:1 crop — that one layout then exports safely to Instagram,
Facebook, and (letterboxed) GBP.
