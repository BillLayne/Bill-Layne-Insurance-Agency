# Plan: Add Spanish-Speaking Dobson Office to Website

## Overview
Add **Aseguranza Comunidad Unida** (Rosa Jimenez's Dobson office) to billlayneinsurance.com with a dedicated bilingual landing page and "Se Habla Español" badges across key pages. Rosa has NO website, so this becomes her entire web presence.

## Office Details
- **Business**: Aseguranza Comunidad Unida
- **Agent**: Rosa Jimenez
- **Address**: 209 S Main St, Dobson, NC 27017
- **Phone**: (336) 356-2200
- **Email**: jimenez.links@gmail.com
- **Carriers**: Same as Bill Layne (Nationwide, Progressive, Travelers, National General, Alamance, NC Grange, Dairyland, Foremost, Hagerty)

---

## Change 1: Create Dedicated Spanish Landing Page

**File**: `espanol/index.html` (new)

A full bilingual landing page at `/espanol/` that serves two audiences:
- **Spanish speakers** searching "seguro de auto Dobson NC", "aseguranza cerca de mi", etc.
- **English speakers** searching "Spanish speaking insurance agent NC"

### Page Structure:
1. **Hero section** — Bilingual headline: "Seguro de Auto y Casa — En Español" / "Auto & Home Insurance — In Spanish". Rosa's photo (or placeholder), Dobson office info, prominent call button (336) 356-2200
2. **"Why Aseguranza Comunidad Unida"** — Key benefits in Spanish with English translations: licensed NC agent, all major carriers, free quotes, local Dobson office
3. **Services section** — Insurance types offered (auto/casa/vida/negocio) with bilingual descriptions
4. **Carrier logos strip** — Same carriers as main site
5. **Office info card** — Address, phone, email, hours, Google Maps embed for 209 S Main St Dobson
6. **Quote form or CTA** — "Llámanos Hoy / Call Us Today" with direct phone link and email
7. **About Rosa** — Brief bilingual bio section
8. **Relationship to Bill Layne Insurance** — Explain that Aseguranza Comunidad Unida is part of the Bill Layne Insurance family

### Technical:
- Uses the existing compiled Tailwind CSS (`css/tailwind-output.css`)
- Indigo color variant (like contact-us) to differentiate from the blue homepage
- Schema.org `InsuranceAgency` structured data for the Dobson location
- Meta tags targeting Spanish insurance keywords
- `<html lang="es">` or bilingual `lang` attributes on sections
- Same nav/footer pattern as other pages

---

## Change 2: Add "Se Habla Español" Badges Across Key Pages

Add a subtle but visible badge/banner linking to `/espanol/` on these pages:

### Pages to update (8 high-traffic pages):
1. **Homepage** (`index.html`) — Badge in hero area or below hero
2. **Contact Us** (`contact-us.html`) — Add Dobson office as second location card + badge
3. **Auto Center** (`auto-center/index.html`) — Badge near hero
4. **Home Insurance** (`home-insurance/index.html`) — Badge near hero
5. **Areas We Serve** (`areas-we-serve.html`) — Badge + mention Dobson office
6. **Claims Center** (`claims-center/index.html`) — Badge near hero
7. **Service Center** (`service-center.html`) — Badge near hero
8. **Resources** (`resources/index.html`) — Badge near hero

### Badge Design:
- Small floating badge or inline banner: 🇲🇽 "Se Habla Español" with link to `/espanol/`
- Positioned consistently (e.g., below hero section or in a thin banner strip)
- Uses green/red/white accent colors (Mexican flag) or warm accent color
- Mobile-friendly — visible but not intrusive

---

## Change 3: Update Contact Page with Second Office

**File**: `contact-us.html`

- Add a **second office location card** alongside the existing Elkin office
- Side-by-side layout: "Elkin Office" | "Dobson Office — Se Habla Español"
- Add Rosa Jimenez to the team grid (or a separate "Dobson Team" section)
- Add a second Google Maps embed for 209 S Main St, Dobson
- Update structured data to include both locations

---

## Change 4: Update Footer Across Key Pages

On the same 8 pages listed above, update the footer's "Connect" section to show both offices:

```
Elkin Office: (336) 835-1993
Dobson Office (Español): (336) 356-2200
```

And update "Service Areas" to mention Dobson explicitly.

---

## Change 5: Add Navigation Link

Add "Español" link to:
- Desktop drawer menu (all pages)
- Mobile slide-up menu panel (all pages)

This will be the last item in the nav, styled slightly differently (e.g., with a 🇲🇽 flag icon or green accent).

---

## Change 6: Update Existing Dobson Pages

**File**: `save-in-dobson-nc/index.html`

- Add mention of the local Dobson office with Rosa Jimenez
- Add "Se Habla Español" callout
- Link to `/espanol/`

---

## Change 7: Rebuild Tailwind CSS

After all HTML changes, run `build-css.bat` to compile any new utility classes used.

---

## Execution Order
1. Create `/espanol/index.html` (the main deliverable)
2. Add badges to the 8 key pages
3. Update contact page with Dobson office
4. Update footers on key pages
5. Update nav menus (desktop drawer + mobile dock) on all pages
6. Update Dobson-specific pages
7. Rebuild CSS
8. Commit and verify live

---

## SEO Impact
- Captures Spanish insurance searches: "seguro de auto NC", "aseguranza Dobson", "insurance en español near me"
- Second location in structured data improves local SEO
- Zero local competitors have bilingual web content
- Rosa gets a web presence she currently lacks entirely
