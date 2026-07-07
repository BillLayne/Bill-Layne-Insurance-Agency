# BLI Canonical Entity Snippets (edit here first, then copy everywhere)

**Last updated:** 2026-07-07 (microsite consolidation, Phase 1)

These two blocks are deployed on every public BLI property. If the NAP, license,
logo, or tagline ever changes, update THIS file first, then re-copy to each property.

**Deployed on:** thecancellationform.com · mynolossform.com · myinsurancephoto.com
(source `index.html` + rebuilt `docs/`) · billlayneinsurance.com/home-inventory/ ·
billlayneinsurance.com/free-tools/ (page-specific variant)

**Excluded:** docs.billlayneinsurance.com (internal, noindex).

---

## 1. Unified JSON-LD entity schema

⚠️ CRITICAL: the `@id` MUST be `https://www.billlayneinsurance.com/#agency` —
with the `#agency` fragment. That is the entity id already used by the homepage
@graph. A different `@id` (e.g. the bare domain) creates a SECOND Google entity
and splits authority instead of pooling it.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  "@id": "https://www.billlayneinsurance.com/#agency",
  "name": "Bill Layne Insurance Agency",
  "image": "https://i.imgur.com/lxu9nfT.png",
  "url": "https://www.billlayneinsurance.com",
  "telephone": "+1-336-835-1993",
  "email": "Save@BillLayneInsurance.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1283 N Bridge St",
    "addressLocality": "Elkin",
    "addressRegion": "NC",
    "postalCode": "28621",
    "addressCountry": "US"
  },
  "areaServed": ["Elkin NC","Surry County NC","Yadkin Valley NC","Wilkes County NC","Yadkin County NC"],
  "priceRange": "$$"
}
</script>
```

Each property also carries `<link rel="canonical">` pointing to ITSELF
(no cross-canonicalization — the vanity domains keep their own identity).

## 2. Unified microsite footer

Used on the tool microsites. The MAIN SITE keeps its own SEO-hardened footer
(city links) — only the NAP text must match exactly. Swap `utm_source` per domain.

```html
<footer style="background:#14184d;color:#f4f6fb;padding:28px 16px;text-align:center;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;">
  <img src="https://i.imgur.com/lxu9nfT.png" alt="Bill Layne Insurance Agency logo" width="130" style="display:block;margin:0 auto 12px;border:0;max-width:130px;height:auto;">
  <strong>Bill Layne Insurance Agency</strong><br>
  1283 N Bridge St, Elkin NC 28621<br>
  <a href="tel:3368351993" style="color:#ffd966;text-decoration:none;">336-835-1993</a> &nbsp;|&nbsp;
  <a href="mailto:Save@BillLayneInsurance.com" style="color:#ffd966;text-decoration:none;">Save@BillLayneInsurance.com</a><br>
  NC License #6571216 &nbsp;&middot;&nbsp; <em>Your Neighbor. Your Agent.</em><br><br>
  <a href="https://www.billlayneinsurance.com/free-tools/?utm_source=DOMAIN-HERE&amp;utm_medium=tool&amp;utm_campaign=footer" style="color:#8fb0ff;">More Free NC Insurance Tools &rarr;</a> &nbsp;|&nbsp;
  <a href="https://www.billlayneinsurance.com" style="color:#8fb0ff;">BillLayneInsurance.com</a>
</footer>
```

Note: hub links use `#8fb0ff` (not brand `#517ddd`) because `#517ddd` fails
contrast on the `#14184d` navy background.

## 3. Canonical NAP (plain text — must match everywhere, character for character)

```
Bill Layne Insurance Agency | 1283 N Bridge St, Elkin NC 28621 | 336-835-1993 | Save@BillLayneInsurance.com | NC License #6571216
```

`Save@` is the PUBLIC display address on every property. `docs@` remains a
backend routing inbox only (cancellation form Code.gs, sendbilldocs) — never display it.

## 4. UTM conventions

- Tool footer → hub: `utm_source=<tool-domain>&utm_medium=tool&utm_campaign=footer`
- Hub → tool: `utm_source=billlayneinsurance&utm_medium=free-tools-hub&utm_campaign=hub-to-<tool>`
- Completion-screen CTAs (Phase 3): `utm_source=<tool-domain>&utm_medium=tool&utm_campaign=<per handoff table>`
- Internal same-domain links get NO UTMs (they would break analytics sessions).

## 5. Cloudflare Web Analytics (Phase 1.4 — pending tokens)

Each property gets its own beacon. Create at Cloudflare Dashboard → Web Analytics →
Add site, then paste before `</body>`:

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TOKEN-HERE"}'></script>
```

| Property | Token |
|---|---|
| billlayneinsurance.com | (pending) |
| thecancellationform.com | (pending) |
| mynolossform.com | (pending) |
| myinsurancephoto.com | (pending) |
