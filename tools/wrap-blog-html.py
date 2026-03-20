#!/usr/bin/env python3
"""
wrap-blog-html.py — Add proper HTML document structure to GEM-template blog posts
that are missing <!DOCTYPE html>, <html>, <head>, and <body> tags.

Adds:
  - <!DOCTYPE html> and <html lang="en">
  - <head> with meta charset, viewport, title, description, canonical, OG tags,
    Twitter Card, Google Analytics, Clarity, BlogPosting JSON-LD
  - <body> wrapper
  - Moves existing <script>/<link>/<style> from top of file into <head>

Skips files that already have proper <head> tags.
"""
import json
import os
import re

BLOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'blog', 'blogs')
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'blog', 'data', 'blogs.json')
BASE_URL = 'https://www.billlayneinsurance.com'

def load_blog_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        blogs = json.load(f)
    return {b['id']: b for b in blogs if b.get('id')}

def extract_h1(html):
    """Extract first h1 content."""
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1)).strip()
    return ''

def escape_attr(text):
    return text.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')

def build_head(blog_id, blog_data, h1_title, existing_head_content):
    """Build a proper <head> section."""
    title = h1_title or blog_id.replace('-', ' ').title()
    description = ''
    image = 'https://i.imgur.com/Z5MxmKE.png'
    date = '2026-01-01'
    author = 'Bill Layne'
    category = 'Insurance'

    if blog_data:
        title = blog_data.get('title', title)
        description = blog_data.get('summary', '')[:160]
        image = blog_data.get('imageUrl', image)
        date = blog_data.get('date', date)
        author = blog_data.get('author', author)
        category = blog_data.get('category', category)

    if not description:
        description = f'{title} - Expert insurance advice from Bill Layne Insurance Agency in Elkin, NC.'[:160]

    post_url = f'{BASE_URL}/blog/blogs/{blog_id}.html'
    safe_title = escape_attr(title)
    safe_desc = escape_attr(description)

    # BlogPosting JSON-LD
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "@id": f"{post_url}#article",
                "headline": title[:110],
                "description": description,
                "image": image,
                "datePublished": date,
                "dateModified": date,
                "articleSection": category,
                "inLanguage": "en-US",
                "mainEntityOfPage": {"@type": "WebPage", "@id": post_url},
                "author": {
                    "@type": "Person",
                    "name": author,
                    "jobTitle": "Licensed Insurance Agent",
                    "worksFor": {
                        "@type": "InsuranceAgency",
                        "name": "Bill Layne Insurance Agency"
                    },
                    "url": f"{BASE_URL}/"
                },
                "publisher": {
                    "@type": "InsuranceAgency",
                    "name": "Bill Layne Insurance Agency",
                    "url": f"{BASE_URL}/",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://i.imgur.com/Z5MxmKE.png",
                        "width": 600,
                        "height": 60
                    },
                    "telephone": "(336) 835-1993"
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
                    {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE_URL}/blog/"},
                    {"@type": "ListItem", "position": 3, "name": title[:60], "item": post_url}
                ]
            }
        ]
    }

    schema_json = json.dumps(schema, indent=4, ensure_ascii=False)

    head = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-N37THY37CR"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-N37THY37CR');
    </script>
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){{
        c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      }})(window, document, "clarity", "script", "vo5s3jhhub");
    </script>
    <title>{safe_title}</title>
    <meta name="description" content="{safe_desc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{post_url}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Bill Layne Insurance Agency">
    <meta property="og:url" content="{post_url}">
    <meta property="og:title" content="{safe_title}">
    <meta property="og:description" content="{safe_desc}">
    <meta property="og:image" content="{image}">
    <meta property="og:locale" content="en_US">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{safe_title}">
    <meta name="twitter:description" content="{safe_desc}">
    <meta name="twitter:image" content="{image}">

    <!-- BlogPosting + BreadcrumbList Schema -->
    <script type="application/ld+json">
{schema_json}
    </script>

{existing_head_content}
</head>
<body>
"""
    return head

def wrap_file(filepath, blog_data_lookup):
    """Wrap a headless blog file with proper HTML structure."""
    filename = os.path.basename(filepath).replace('.html', '')

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has <head>
    if '<head>' in content or '<head ' in content:
        return False

    blog_data = blog_data_lookup.get(filename)
    h1_title = extract_h1(content)

    # Extract existing <script>, <link>, <style> from top of file
    # These go into <head>
    head_content_lines = []
    body_start = 0
    lines = content.split('\n')

    in_style = False
    for i, line in enumerate(lines):
        stripped = line.strip()

        if in_style:
            head_content_lines.append(line)
            if '</style>' in stripped:
                in_style = False
            continue

        if not stripped or stripped.startswith('<!--'):
            # Skip empty lines and comments at top
            if stripped.startswith('<!-- GEM'):
                continue  # Skip GEM comment
            if not stripped:
                continue
            head_content_lines.append(line)
            continue

        if stripped.startswith('<script src=') or stripped.startswith('<link '):
            # Move external scripts/links to head
            # But skip Google Analytics (we add our own)
            if 'googletagmanager' not in stripped and 'clarity.ms' not in stripped:
                head_content_lines.append('    ' + stripped)
            continue

        if stripped.startswith('<style'):
            head_content_lines.append('    ' + stripped)
            if '</style>' not in stripped:
                in_style = True
            continue

        # First non-head content line — this is where body starts
        body_start = i
        break

    body_content = '\n'.join(lines[body_start:])

    # Remove any existing Google Analytics or Clarity from body
    body_content = re.sub(r'<!-- Google tag.*?</script>\s*', '', body_content, flags=re.DOTALL)
    body_content = re.sub(r'<!-- Microsoft Clarity.*?</script>\s*', '', body_content, flags=re.DOTALL)

    # Build head with existing content moved in
    existing_head = '\n'.join(head_content_lines)
    head = build_head(filename, blog_data, h1_title, existing_head)

    # Check if body already has closing tags
    has_closing = '</body>' in body_content or '</html>' in body_content
    if not has_closing:
        body_content = body_content.rstrip() + '\n</body>\n</html>\n'
    elif '</html>' not in body_content:
        body_content = body_content.rstrip() + '\n</html>\n'

    final = head + body_content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final)

    return True

def main():
    blog_data_lookup = load_blog_data()
    print(f"Loaded {len(blog_data_lookup)} blog entries from blogs.json")

    blog_files = sorted([f for f in os.listdir(BLOG_DIR) if f.endswith('.html')])
    print(f"Found {len(blog_files)} blog HTML files")

    wrapped = 0
    skipped = 0

    for filename in blog_files:
        filepath = os.path.join(BLOG_DIR, filename)
        if wrap_file(filepath, blog_data_lookup):
            wrapped += 1
        else:
            skipped += 1

    print(f"\nResults:")
    print(f"  Wrapped with proper HTML: {wrapped}")
    print(f"  Already had <head> (skipped): {skipped}")

if __name__ == '__main__':
    main()
