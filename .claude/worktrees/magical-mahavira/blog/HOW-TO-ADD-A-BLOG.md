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
- Extract images from base64 in the HTML and upload them to **Imgur** for fast CDN hosting
- Replace base64 `src` attributes with Imgur direct URLs (`https://i.imgur.com/...`)
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

### Step 3: Handle Images — Upload to Imgur (IMPORTANT)
All base64 images in the blog HTML must be extracted, uploaded to Imgur, and replaced with Imgur direct URLs. This keeps HTML files small and pages loading fast via Imgur's CDN.

**For base64 images (`data:image/...`):**
1. Find ALL base64 image strings in the HTML using regex: `src="(data:image/(png|jpeg|jpg|gif|webp);base64,([^"]+))"`
2. For **each** base64 image found:
   a. Decode the base64 string to binary
   b. Save it temporarily as a file (e.g., `/tmp/blog-img-1.png`)
   c. Upload it to **Imgur** using the anonymous upload API:
      ```
      curl -s -X POST https://api.imgur.com/3/image \
        -H "Authorization: Client-ID YOUR_CLIENT_ID" \
        -F "image=@/tmp/blog-img-1.png"
      ```
      *(Use the Imgur Client-ID stored in the environment or ask the user for one)*
   d. Get the direct URL from the response: `https://i.imgur.com/XXXXXXX.png`
   e. Replace the base64 `src` in the HTML with the Imgur direct URL
3. Note which image is the **hero image** (first `<img>` or one with class `hero-img`) — you'll need its Imgur URL for the `imageUrl` field in blogs.json

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
- For new blog posts, this will be an **Imgur URL** (from Step 3)
- Note the hero image's Imgur URL — it goes in the `imageUrl` field of the blogs.json entry
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
  "imageUrl": "https://i.imgur.com/XXXXXXX.png",
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
- `imageUrl` — Use the **Imgur direct URL** for the hero image (e.g., `https://i.imgur.com/XXXXXXX.png`). Older posts may still use local paths like `./assets/images/...` — that's fine, leave those as-is.
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
- [ ] No base64 `data:image` strings remain in the blog HTML
- [ ] All images in the blog HTML use Imgur URLs (or existing external/local URLs)
- [ ] Hero image and inline images have `loading="lazy"` (except hero) and `width`/`height` attributes
- [ ] `blogs.json` has the new entry at the **top** with today's date
- [ ] `imageUrl` in blogs.json uses the Imgur hero image URL
- [ ] `window.__BLOG_DATA__` in `blog/index.html` line ~897 has the **same number of entries** as `blogs.json` (count `"id":` occurrences in both — they must match)
- [ ] The new blog's `id` appears in both `blogs.json` AND the embedded data on line ~897

---

## File Locations Reference

| What | Where |
|------|-------|
| Blog HTML files | `blog/blogs/[slug].html` |
| Blog data (JSON) | `blog/data/blogs.json` |
| Blog landing page | `blog/index.html` |
| Blog app logic | `blog/app.js` |
| Hero images (new posts) | Hosted on Imgur (`https://i.imgur.com/...`) |
| Hero images (older posts) | `blog/assets/images/[name]-hero.[png\|jpg]` (leave as-is) |

---

## Compliance Reminders
- Date must be today's real date, never a future month
- Founding year is **2005** (not 2004)
- Service area is **all 100 NC counties** (not county-specific)
- NC minimum liability limits are **50/100/50** (not 30/60/25)
- Do not include unsubstantiated dollar savings claims
- Copyright year is **2026**
