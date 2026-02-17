# How to Add a New Blog Post

Copy and paste these instructions to Claude each time you want to add a new blog.

---

## What to Tell Claude

**Copy this prompt and fill in the blanks:**

> I need to add a new blog post to my Bill Layne Insurance website. Here is what I need:
>
> **Blog HTML file:** [paste the file path on your computer, e.g. C:\Users\bill\Documents\my-new-blog.html]
>
> **Hero image:** [paste the file path, e.g. C:\Users\bill\Documents\blog-hero.png]
>
> Please add this blog to my site following the standard process.

---

## What Claude Needs to Do (Step-by-Step)

### Step 1: Save the Hero Image
- Copy the hero image from the user's file path to:
  `blog/assets/images/[descriptive-name]-hero.[jpg|png]`
- Use a kebab-case name that matches the blog topic (e.g., `nc-homeowners-flood-coverage-2026-hero.png`)

### Step 2: Copy the Blog HTML File
- Save the blog HTML file to:
  `blog/blogs/[slug-matching-the-title].html`
- The filename should be a URL-friendly slug of the blog title

### Step 3: Handle Base64 Images in the Blog HTML
- If the blog HTML contains base64-encoded images (`data:image/...`), extract them:
  1. Save each base64 image to `blog/assets/images/` with a descriptive name
  2. Replace the base64 `src` in the HTML with the relative path: `../assets/images/[filename]`
- This keeps the HTML file small and pages loading fast

### Step 4: Update the Hero Image Path in the Blog HTML
- Find the `<img>` tag with class `hero-img` in the blog HTML
- Update its `src` to point to: `../assets/images/[hero-image-name]`

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
  "tags": ["Tag1", "Tag2", "Tag3", "Elkin", "North Carolina"],
  "author": "Bill Layne",
  "date": "YYYY-MM-DD",
  "category": "Auto Insurance OR Home Insurance OR General",
  "readTime": "X min read",
  "featured": true
}
```

**Important fields:**
- `date` — Use today's actual date (YYYY-MM-DD format). Do NOT use a future date.
- `summary` — Short preview text shown on the blog landing page card
- `tags` — Used for filtering on the blog page
- `featured: true` — Makes it show prominently
- All three URL fields (`url`, `linkUrl`, `readMoreUrl`) should be identical

### Step 6: Update the Embedded Blog Data in index.html
- Open `blog/index.html`
- Find the `<script>` tag containing `window.__BLOG_DATA__` (around line 897)
- Update it to match the current contents of `blogs.json`
- This is a bulletproof fallback so blogs load even on local file:// protocol

### Step 7: Verify
- Confirm the blog HTML file is in `blog/blogs/`
- Confirm the hero image is in `blog/assets/images/`
- Confirm `blogs.json` has the new entry at the top
- Confirm `blog/index.html` embedded data matches `blogs.json`
- Confirm no base64 images remain in the blog HTML (they should be extracted to separate files)

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
