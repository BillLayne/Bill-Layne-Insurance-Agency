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
- Extract the hero image from the base64 embedded in the HTML
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

### Step 3: Handle Images in the Blog HTML
- Check the blog HTML for images. They may be in one of three forms:
  - **Base64 embedded** (`data:image/...`) — Extract each one, save to `blog/assets/images/`, and replace the `src` with the relative path
  - **External URLs** (e.g., Unsplash) — These can stay as-is, but still save a copy of the hero image locally for the landing page card
  - **Already local paths** — No action needed
- For base64 images:
  1. Save each base64 image to `blog/assets/images/` with a descriptive name
  2. The hero image should be named `[blog-slug]-hero.[png|jpg]`
  3. Other inline images should be named `[blog-slug]-[description].[png|jpg]`
  4. Replace every base64 `src` in the HTML with the relative path: `../assets/images/[filename]`
- Verify NO `data:image` strings remain in the final HTML
- This keeps the HTML file small and pages loading fast

### Step 4: Ensure a Local Hero Image Exists for the Landing Page Card
- The blog landing page (`blog/index.html`) needs a **local** hero image for the preview card
- Check that a hero image file exists in `blog/assets/images/` matching the `imageUrl` in the blogs.json entry
- If the blog HTML only has an external URL hero image (e.g., Unsplash), you still need a local image file for the landing page card — download or create one
- Find the `<img>` tag with class `hero-img` in the blog HTML and note or update its `src`

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
  "imageUrl": "./assets/images/[hero-image-name]",
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
- `title` — Extracted from the blog HTML (or user-provided override)
- `summary` — Written from the blog content (or user-provided override)
- `tags` — Generated from the content, always include "North Carolina" (or user-provided override)
- `featured: true` — Makes it show prominently
- All three URL fields (`url`, `linkUrl`, `readMoreUrl`) should be identical

### Step 6: Update the Embedded Blog Data in index.html (CRITICAL)
- **This step is required or the blog will NOT appear on the landing page.**
- Open `blog/index.html` — find line ~897 containing `window.__BLOG_DATA__`
- This is a single very long line: `<script>window.__BLOG_DATA__ = [...];</script>`
- Replace the entire JSON array on that line with the **current full contents** of `blog/data/blogs.json`, minified to a single line
- **How to do it:** Read `blog/data/blogs.json`, minify it (remove all newlines and unnecessary whitespace), then replace line 897 with: `<script>window.__BLOG_DATA__ = MINIFIED_JSON;</script>`
- **Verify** by checking that the number of `"id":` occurrences on line 897 matches the count in `blogs.json`
- This embedded data is the primary data source for the blog landing page — if it's out of sync, blogs won't show

### Step 7: Verify (ALL must pass)
- [ ] Blog HTML file exists in `blog/blogs/`
- [ ] Hero image file exists in `blog/assets/images/`
- [ ] No base64 `data:image` strings remain in the blog HTML
- [ ] `blogs.json` has the new entry at the **top** with today's date
- [ ] `window.__BLOG_DATA__` in `blog/index.html` line ~897 has the **same number of entries** as `blogs.json` (count `"id":` occurrences in both — they must match)
- [ ] The new blog's `id` appears in both `blogs.json` AND the embedded data on line ~897

---

## File Locations Reference

| What | Where |
|------|-------|
| Blog HTML files | `blog/blogs/[slug].html` |
| Hero images | `blog/assets/images/[name]-hero.[png\|jpg]` |
| Blog data (JSON) | `blog/data/blogs.json` |
| Blog landing page | `blog/index.html` |
| Blog app logic | `blog/app.js` |

---

## Compliance Reminders
- Date must be today's real date, never a future month
- Founding year is **2005** (not 2004)
- Service area is **all 100 NC counties** (not county-specific)
- NC minimum liability limits are **50/100/50** (not 30/60/25)
- Do not include unsubstantiated dollar savings claims
- Copyright year is **2026**
