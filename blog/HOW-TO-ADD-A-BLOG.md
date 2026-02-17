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

### Step 3: Extract ALL Base64 Images from the Blog HTML
- The blog HTML contains base64-encoded images (`data:image/...`) including the hero image
- Extract **every** base64 image:
  1. Save each base64 image to `blog/assets/images/` with a descriptive name
  2. The hero image should be named `[blog-slug]-hero.[png|jpg]`
  3. Other inline images should be named `[blog-slug]-[description].[png|jpg]`
  4. Replace every base64 `src` in the HTML with the relative path: `../assets/images/[filename]`
- Verify NO `data:image` strings remain in the final HTML
- This keeps the HTML file small and pages loading fast

### Step 4: Confirm the Hero Image Path in the Blog HTML
- Find the `<img>` tag with class `hero-img` in the blog HTML
- Confirm its `src` now points to: `../assets/images/[hero-image-name]` (should already be updated from Step 3)

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

### Step 6: Update the Embedded Blog Data in index.html
- Open `blog/index.html`
- Find the `<script>` tag containing `window.__BLOG_DATA__` (around line 897)
- Update it to match the current contents of `blogs.json`
- This is a bulletproof fallback so blogs load even on local file:// protocol

### Step 7: Verify
- Confirm the blog HTML file is in `blog/blogs/`
- Confirm the hero image + any inline images are in `blog/assets/images/`
- Confirm NO base64 `data:image` strings remain in the blog HTML
- Confirm `blogs.json` has the new entry at the top with today's date
- Confirm `blog/index.html` embedded data matches `blogs.json`

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
