# How to Add Videos & Shorts to the Video Page

Copy and paste these instructions to Claude each time you want to add new videos or shorts.

---

## What to Tell Claude

**Copy this prompt and fill in what applies:**

> I need to add new videos/shorts to my video landing page at `videos/index.html`.
>
> **New Videos (full-length):**
> 1. YouTube link: [paste link] | Title: [title] | Category: [auto/home/tips/claims]
> 2. YouTube link: [paste link] | Title: [title] | Category: [auto/home/tips/claims]
>
> **New Shorts:**
> 1. YouTube link: [paste link] | Title: [title]
> 2. YouTube link: [paste link] | Title: [title]
>
> Please add these to my video page following the standard process.

---

## What Claude Needs to Do (Step-by-Step)

### For Full-Length Videos

**Step 1:** Open `videos/index.html` and find the `const videos = [` array (around line 932).

**Step 2:** Extract the YouTube video ID from the link.
- From `https://www.youtube.com/watch?v=ABC123` the ID is `ABC123`
- From `https://youtu.be/ABC123` the ID is `ABC123`

**Step 3:** Add the new video entry at the **TOP** of the array (newest first), right after `const videos = [`. Use this format:

```javascript
{ id: 'YOUTUBE_VIDEO_ID', title: 'Video Title Here', category: 'auto', description: 'One sentence description of the video content.' },
```

**Categories:** `auto` | `home` | `tips` | `claims`

**Step 4:** Write a short `description` (1-2 sentences) based on the video title. Keep it informative and NC-specific.

### For Shorts

**Step 1:** Open `videos/index.html` and find the `const shorts = [` array (around line 970).

**Step 2:** Extract the YouTube video ID from the link.
- From `https://youtube.com/shorts/ABC123` the ID is `ABC123`

**Step 3:** Add the new short entry at the **TOP** of the array (newest first). Use this format:

```javascript
{ id: 'YOUTUBE_VIDEO_ID', title: 'Short Title Here' },
```

Shorts do NOT need a category or description — just `id` and `title`.

### Step 4: Update the Video Count Stat

Find the stats bar section (around line 486) that shows the video count:

```html
<div class="text-3xl md:text-4xl font-display font-black text-primary-600">50+</div>
<div class="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Videos</div>
```

Update the count number if needed to reflect the total (videos + shorts combined).

### Step 5: Verify
- New videos appear at the top of the `const videos` array
- New shorts appear at the top of the `const shorts` array
- YouTube IDs are correct (no extra characters)
- Titles have apostrophes escaped with backslash: `\'`
- Video count stat is updated if it no longer matches
- No compliance issues in titles or descriptions (no unsubstantiated claims)

---

## Current Structure Reference

**Videos array** (`const videos = [...]`):
```javascript
{ id: 'YOUTUBE_ID', title: 'Title', category: 'auto|home|tips|claims', description: 'Description text.' },
```

**Shorts array** (`const shorts = [...]`):
```javascript
{ id: 'YOUTUBE_ID', title: 'Title' },
```

**File location:** `videos/index.html`

---

## Example

User provides:
> YouTube link: https://www.youtube.com/watch?v=XyZ789
> Title: Why Your NC Deductible Matters More Than You Think
> Category: tips

Claude adds to top of `const videos`:
```javascript
{ id: 'XyZ789', title: 'Why Your NC Deductible Matters More Than You Think', category: 'tips', description: 'Your deductible choice directly impacts your premium and out-of-pocket costs after a claim. Learn how to pick the right amount for your situation.' },
```

User provides:
> YouTube short: https://youtube.com/shorts/AbC456
> Title: Insurance Humor #17

Claude adds to top of `const shorts`:
```javascript
{ id: 'AbC456', title: '🤣 Insurance Humor #17' },
```
