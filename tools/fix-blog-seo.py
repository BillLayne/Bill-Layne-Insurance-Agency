#!/usr/bin/env python3
"""
fix-blog-seo.py — Batch-update blog posts with proper canonical URLs,
meta descriptions from blogs.json summaries, and improved OG/Twitter tags.
"""
import json
import os
import re

BLOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'blog', 'blogs')
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'blog', 'data', 'blogs.json')
BASE_URL = 'https://www.billlayneinsurance.com/blog/blogs'

def load_blog_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        blogs = json.load(f)
    # Build lookup by filename (id)
    lookup = {}
    for blog in blogs:
        bid = blog.get('id', '')
        if bid:
            lookup[bid] = blog
    return lookup

def fix_blog_file(filepath, blog_data):
    filename = os.path.basename(filepath).replace('.html', '')
    data = blog_data.get(filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    changed = False

    # 1. Add canonical URL if missing
    if 'rel="canonical"' not in html:
        canonical = f'    <link rel="canonical" href="{BASE_URL}/{filename}.html">\n'
        # Insert before </head>
        html = html.replace('</head>', canonical + '</head>', 1)
        changed = True

    # 2. Update meta description if we have a better summary from blogs.json
    if data and data.get('summary'):
        summary = data['summary'][:160]
        # Replace generic meta description
        old_desc_pattern = r'<meta name="description" content="Blog - Blogs - [^"]*">'
        if re.search(old_desc_pattern, html):
            new_desc = f'<meta name="description" content="{escape_html_attr(summary)}">'
            html = re.sub(old_desc_pattern, new_desc, html)
            changed = True

        # Also fix OG description if it's the generic pattern
        old_og_pattern = r'<meta property="og:description" content="Blog - Blogs - [^"]*">'
        if re.search(old_og_pattern, html):
            new_og = f'<meta property="og:description" content="{escape_html_attr(summary)}">'
            html = re.sub(old_og_pattern, new_og, html)
            changed = True

        # Fix Twitter description if generic
        old_tw_pattern = r'<meta name="twitter:description" content="Blog - Blogs - [^"]*">'
        if re.search(old_tw_pattern, html):
            new_tw = f'<meta name="twitter:description" content="{escape_html_attr(summary)}">'
            html = re.sub(old_tw_pattern, new_tw, html)
            changed = True

    # 3. Update OG image to use blog-specific image if available
    if data and data.get('imageUrl') and data['imageUrl'] != 'https://i.imgur.com/Z5MxmKE.png':
        img_url = data['imageUrl']
        # Replace generic site OG image with blog-specific hero image
        old_og_img = '<meta property="og:image" content="https://i.imgur.com/Z5MxmKE.png">'
        if old_og_img in html:
            html = html.replace(old_og_img, f'<meta property="og:image" content="{img_url}">')
            changed = True
        old_tw_img = '<meta name="twitter:image" content="https://i.imgur.com/Z5MxmKE.png">'
        if old_tw_img in html:
            html = html.replace(old_tw_img, f'<meta name="twitter:image" content="{img_url}">')
            changed = True

    # 4. Add og:type article if it says "website"
    if '<meta property="og:type" content="website">' in html:
        html = html.replace(
            '<meta property="og:type" content="website">',
            '<meta property="og:type" content="article">'
        )
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

    return changed

def escape_html_attr(text):
    """Escape quotes and ampersands for HTML attribute values."""
    return text.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')

def main():
    blog_data = load_blog_data()
    print(f"Loaded {len(blog_data)} blog entries from blogs.json")

    blog_files = [f for f in os.listdir(BLOG_DIR) if f.endswith('.html')]
    print(f"Found {len(blog_files)} blog HTML files")

    updated = 0
    canonical_added = 0
    desc_updated = 0

    for filename in sorted(blog_files):
        filepath = os.path.join(BLOG_DIR, filename)
        bid = filename.replace('.html', '')

        # Track what we're about to fix
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        had_canonical = 'rel="canonical"' in content
        had_generic_desc = 'Blog - Blogs -' in content

        if fix_blog_file(filepath, blog_data):
            updated += 1
            if not had_canonical:
                canonical_added += 1
            if had_generic_desc and bid in blog_data:
                desc_updated += 1

    print(f"\nResults:")
    print(f"  Files updated: {updated}/{len(blog_files)}")
    print(f"  Canonical URLs added: {canonical_added}")
    print(f"  Descriptions improved: {desc_updated}")
    print(f"  OG type fixed to 'article': (included in updates)")

if __name__ == '__main__':
    main()
