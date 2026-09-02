# How to Add a New Blog Post

Copy and paste these instructions to Claude each time you want to add a new blog.

---

## What to Tell Claude

**Use the blog-tool.html on your computer (easiest), or just tell Claude:**

> I need to add a new blog post to my Bill Layne Insurance website.
>
> **Blog HTML file:** [paste the file path, e.g. C:\Users\bill\Documents\my-new-blog.html]
>
> Please add this blog to my site following the standard process in `blog/HOW-TO-ADD-A-BLOG.md`.

**That's it!** The file path is the only thing you need to provide. Claude will:
- Extract images from base64 in the HTML and upload them to the **BLI Image Host** (img.billlayneinsurance.com)
- Replace base64 `src` attributes with hosted URLs (`https://img.billlayneinsurance.com/i/...`)
- Add `loading="lazy"` and `width`/`height` attributes to images for performance
- Pull the title from the blog's `<h1>` or `<title>` tag
- Write a 1-2 sentence summary for the landing page card
- Determine the category (Auto Insurance, Home Insurance, or General)
- Estimate the read time from word count
- Generate relevant tags (always including "North Carolina")

**Optional overrides:** If you want to specify any of the above yourself (title, summary, category, tags, read time), include them in your message and Claude will use your values instead of auto-generating.

---

## What Claude Needs to Do (Step-by-Step)

### Step 1: Read the Blog HTML and Extract Metadata
- Open and read the blog HTML file from the user's file path
- Extract the **title** from the `<h1>` tag or `<title>` tag (unless the user provided one)
- Write a **1-2 sentence summary** based on the blog content (unless the user provided one)
- Determine the **category**: Auto Insurance, Home Insurance, or General (unless the user provided one)
- Estimate **read time** based on word count (unless the user provided one)
- Generate **tags** from the content — always include "North Carolina" (unless the user provided tags)

### Step 2: Copy the Blog HTML File
- Save the blog HTML file to:
  `blog/blogs/[slug-matching-the-title].html`
- The filename should be a URL-friendly slug of the blog title

### Step 3: Handle Images — Upload to the BLI Image Host (IMPORTANT)
All base64 images must be extracted, uploaded, and replaced with hosted URLs. This keeps HTML files small and pages fast.

**All images live on `img.billlayneinsurance.com` — the site has ZERO Imgur dependencies as of 2026-08-04 (full migration, 474 images).** Never introduce a new `i.imgur.com` URL. Bill's headshot is `https://img.billlayneinsurance.com/i/2026/08/blog-ndfmjxh-skjqy5.png`.

**For base64 images (`data:image/...`):**
1. Find ALL base64 image strings using regex: `src="(data:image/(png|jpeg|jpg|gif|webp);base64,([^"]+))"`
2. For **each** one: decode to binary, save temporarily, upload to the BLI image host, and replace the base64 `src` with the returned URL (`https://img.billlayneinsurance.com/i/YYYY/MM/<name>.webp`)
3. Note which image is the **hero** (first `<img>`, or one with class `hero-img`) — its URL goes in the `imageUrl` field in blogs.json

**For external URLs** (e.g., Unsplash):
- These can stay as-is — no upload needed
- Note the hero image URL for blogs.json

**For already local paths:**
- No action needed

**After replacing all images, add performance attributes:**
- Add `loading="lazy"` to **all** `<img>` tags **except** the hero image (the first/topmost image)
- Add `width` and `height` attributes to all `<img>` tags for CLS (Cumulative Layout Shift) prevention
  - Use reasonable defaults if exact dimensions aren't known (e.g., `width="800" height="450"` for hero, `width="700" height="400"` for inline)

**Verify:** NO `data:image` base64 strings remain in the final HTML.

### Step 4: Confirm Hero Image URL for Landing Page Card
- The blog landing page (`blog/index.html`) needs a hero image URL for the preview card
- For new blog posts, this will be an **img.billlayneinsurance.com URL** (from Step 3)
- Note the hero image URL — it goes in the `imageUrl` field of the blogs.json entry
- No local hero image file is needed for new posts (existing older posts may still use local paths — that's fine)

### Step 5: Add Entry to blogs.json
- Open `blog/data/blogs.json`
- Add a NEW entry at the **top** of the array (position 1, so it appears first on the blog page)
- Use this format:

```json
{
  "id": "short-unique-id",
  "title": "Full Blog Title Here",
  "url": "./blogs/[filename].html",
  "linkUrl": "./blogs/[filename].html",
  "readMoreUrl": "./blogs/[filename].html",
  "imageUrl": "https://img.billlayneinsurance.com/i/YYYY/MM/hero-name.webp",
  "summary": "1-2 sentence summary for the blog card preview.",
  "tags": ["Tag1", "Tag2", "Tag3", "North Carolina"],
  "author": "Bill Layne",
  "date": "YYYY-MM-DD",
  "category": "Auto Insurance OR Home Insurance OR General",
  "readTime": "X min read",
  "featured": true
}
```

**Important fields:**
- `date` — Use today's actual date (YYYY-MM-DD format). Do NOT use a future date.
- `imageUrl` — Use the **img.billlayneinsurance.com URL** for the hero image. Older posts may still use local paths like `./assets/images/...` — that's fine, leave those as-is.
- `title` — Extracted from the blog HTML (or user-provided override)
- `summary` — Written from the blog content (or user-provided override)
- `tags` — Generated from the content, always include "North Carolina" (or user-provided override)
- `featured: true` — Makes it show prominently
- All three URL fields (`url`, `linkUrl`, `readMoreUrl`) should be identical

### Step 6: Update the Embedded Blog Data in index.html (CRITICAL)
- **This step is required or the blog will NOT appear on the landing page.**
- Open `blog/index.html` and search for `window.__BLOG_DATA__`
- This is a single very long line: `<script>window.__BLOG_DATA__ = [...];</script>`
- Replace the entire JSON array on that line with the **current full contents** of `blog/data/blogs.json`, minified to a single line
- **How to do it:** Read `blog/data/blogs.json`, minify it (remove all newlines and unnecessary whitespace), then replace that script with: `<script>window.__BLOG_DATA__ = MINIFIED_JSON;</script>`
- **Verify** by checking that the number of `"id":` occurrences in the embedded script matches the count in `blogs.json`
- This embedded data is the primary data source for the blog landing page — if it's out of sync, blogs won't show

### Step 5A: Canonical + Link Hygiene (REQUIRED — checked before every publish)
- The canonical URL has exactly ONE correct shape:
  `https://www.billlayneinsurance.com/blog/blogs/[slug]`
  — **www** host (apex 301s to www), **no `.html`** (Cloudflare 308s it away), no trailing slash.
- `og:url`, `twitter:url` (if present), the `BlogPosting` `@id`/`mainEntityOfPage`, and the breadcrumb `item` must all use that same URL. The BlogPosting node id is `...#blogposting` (not `#article`).
- Every internal `billlayneinsurance.com` link in the post body must use the **www** host.
- Internal links to `/get-quote` must use `?src=blog_[campaign]_[placement]` — **NEVER `utm_*` on internal links** (UTMs reset GA4 attribution). Share links to Facebook/newsletter/etc. DO keep their `utm_*` params; that's correct for outbound.
- The schema `author` object MUST carry `"@id": "https://www.billlayneinsurance.com/#founder"` (Person "Bill Layne") — this merges every post's author with the sitewide entity graph. If the author is the agency, use `"@id": "https://www.billlayneinsurance.com/#agency"` instead. NEVER invent a new Person/Organization `@id` (no `#bill-layne`, no `#organization`). Author `url` is `https://www.billlayneinsurance.com/about/`.
- A full audit + repair of all existing posts shipped 2026-08-03 (commit bb38ade). Three posts intentionally canonicalize to a DIFFERENT post (duplicate-content consolidation) — never "fix" those to self-canonical, and never add them to the sitemap.

### Step 6A: Update Crawlable Latest Posts + Blog Schema
- In `blog/index.html`, update the visible "Latest NC Insurance Guides" HTML section so the newest 5-6 posts are present as regular `<article>` cards with title, summary, date, category, and an absolute/usable link.
- Update the `<script type="application/ld+json">` near the top of `blog/index.html` so the `Blog`, `ItemList`, and newest `BlogPosting` entries match the latest posts.
- Update the homepage `Latest from Our Blog` static cards in `index.html` when the newest post should appear on the homepage.
- This is important because search engines and AI crawlers should see the newest blog titles and summaries in raw HTML/schema, not only inside `window.__BLOG_DATA__` or JavaScript-rendered cards.

### Step 6B: Rebuild the sitemaps (REQUIRED — since 2026-09-02 the sitemaps are GENERATED, never hand-edited)
- `sitemap.xml` is now a sitemap **index** pointing at `sitemap-pages.xml`, `sitemap-blog.xml`, and `sitemap-images.xml`. Do not add `<url>` blocks by hand.
- After the post is committed (lastmod comes from the file's last git commit), run from the repo root:
  ```bash
  python tools/build-sitemaps.py
  ```
- The generator lists a post only if it has a `<link rel="canonical">` that matches its own extensionless `www` URL and no `noindex` tag, so a post that fails Step 5A silently stays out. Run `python tools/build-sitemaps.py --check` to see what was skipped and why.
- Commit the three regenerated XML files with the post.
- Do NOT touch `sitemap-images.xml` — it covers landing pages only, never blog posts

### Step 7: Verify (ALL must pass)
- [ ] Blog HTML file exists in `blog/blogs/`
- [ ] No base64 `data:image` strings remain in the blog HTML
- [ ] All images use hosted URLs (img.billlayneinsurance.com for new, existing external/local OK)
- [ ] Hero image and inline images have `loading="lazy"` (except hero) and `width`/`height` attributes
- [ ] Canonical / og:url / schema @ids all use `https://www.billlayneinsurance.com/blog/blogs/[slug]` (www, no .html) — see Step 5A
- [ ] No `utm_*` on internal links (only on outbound share links)
- [ ] `blogs.json` has the new entry at the **top** with today's date
- [ ] `imageUrl` in blogs.json uses the hosted hero image URL
- [ ] `window.__BLOG_DATA__` in `blog/index.html` has the **same number of entries** as `blogs.json` (count `"id":` occurrences in both — they must match)
- [ ] The new blog's `id` appears in both `blogs.json` AND the embedded data script
- [ ] The newest blog appears in the raw HTML "Latest NC Insurance Guides" section and in the blog JSON-LD schema
- [ ] `python tools/build-sitemaps.py` was run after the commit and `sitemap-blog.xml` lists the new post (extensionless URL)
- [ ] After pushing: Search Console → URL Inspection → Request Indexing on the new URL

---

## File Locations Reference

| What | Where |
|------|-------|
| Blog HTML files | `blog/blogs/[slug].html` |
| Blog data (JSON) | `blog/data/blogs.json` |
| Blog landing page | `blog/index.html` |
| Blog app logic | `blog/app.js` |
| Hero images (new posts) | Hosted on BLI Image Host (`https://img.billlayneinsurance.com/i/...`) |
| Hero images (older posts) | `blog/assets/images/[name]-hero.[png\|jpg]` (leave as-is) |

---

## Compliance Reminders
- Date must be today's real date, never a future month
- Founding year is **2005** (not 2004)
- Service area is **all 100 NC counties** (not county-specific)
- NC minimum liability limits are **50/100/50** (not 30/60/25)
- Do not include unsubstantiated dollar savings claims
- Copyright year is **2026**
