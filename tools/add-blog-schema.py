#!/usr/bin/env python3
"""
add-blog-schema.py — Batch-add BlogPosting JSON-LD schema + BreadcrumbList
to all blog posts using data from blogs.json.

Adds:
  1. BlogPosting schema (author, datePublished, description, image, publisher)
  2. BreadcrumbList schema (Home > Blog > Post Title)

Skips files that already have BlogPosting schema.
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
    lookup = {}
    for blog in blogs:
        bid = blog.get('id', '')
        if bid:
            lookup[bid] = blog
    return lookup

def escape_json_string(text):
    """Escape special characters for JSON string values."""
    return text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ').replace('\r', '').replace('\t', ' ')

def extract_title_from_html(html):
    """Extract <title> content from HTML."""
    m = re.search(r'<title>([^<]+)</title>', html)
    return m.group(1).strip() if m else ''

def extract_description_from_html(html):
    """Extract meta description from HTML."""
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    return m.group(1).strip() if m else ''

def build_schema(blog_id, blog_data, html):
    """Build BlogPosting + BreadcrumbList JSON-LD for a blog post."""
    title = ''
    description = ''
    image = 'https://i.imgur.com/Z5MxmKE.png'
    date = '2026-01-01'
    author = 'Bill Layne'
    category = 'Insurance'
    word_count = 0

    # Try to get data from blogs.json first
    if blog_data:
        title = blog_data.get('title', '')
        description = blog_data.get('summary', '')
        image = blog_data.get('imageUrl', image)
        date = blog_data.get('date', date)
        author = blog_data.get('author', author)
        category = blog_data.get('category', category)

    # Fallback to HTML if blogs.json data missing
    if not title:
        title = extract_title_from_html(html)
    if not description:
        description = extract_description_from_html(html)

    # Estimate word count from body text
    body_text = re.sub(r'<[^>]+>', ' ', html)
    body_text = re.sub(r'\s+', ' ', body_text)
    word_count = len(body_text.split())

    post_url = f'{BASE_URL}/blog/blogs/{blog_id}.html'

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "@id": f"{post_url}#article",
                "headline": title[:110],  # Google max 110 chars
                "description": description[:160],
                "image": image,
                "datePublished": date,
                "dateModified": date,
                "wordCount": word_count,
                "articleSection": category,
                "inLanguage": "en-US",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": post_url
                },
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
                    "telephone": "(336) 835-1993",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "1283 N Bridge St",
                        "addressLocality": "Elkin",
                        "addressRegion": "NC",
                        "postalCode": "28621",
                        "addressCountry": "US"
                    }
                },
                "isPartOf": {
                    "@type": "Blog",
                    "@id": f"{BASE_URL}/blog/#blog",
                    "name": "Bill Layne Insurance Blog",
                    "url": f"{BASE_URL}/blog/"
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": f"{BASE_URL}/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Blog",
                        "item": f"{BASE_URL}/blog/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": title[:60],
                        "item": post_url
                    }
                ]
            }
        ]
    }

    return json.dumps(schema, indent=4, ensure_ascii=False)

def add_schema_to_file(filepath, blog_data_lookup):
    """Add BlogPosting schema to a single blog file."""
    filename = os.path.basename(filepath).replace('.html', '')

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Skip if already has BlogPosting schema
    if 'BlogPosting' in html:
        return False

    blog_data = blog_data_lookup.get(filename)
    schema_json = build_schema(filename, blog_data, html)

    # Build the schema script tag
    schema_tag = f'\n    <!-- Structured Data: BlogPosting + BreadcrumbList -->\n    <script type="application/ld+json">\n{schema_json}\n    </script>\n'

    # Insert before </head>
    if '</head>' in html:
        html = html.replace('</head>', schema_tag + '</head>', 1)
    else:
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

    return True

def main():
    blog_data_lookup = load_blog_data()
    print(f"Loaded {len(blog_data_lookup)} blog entries from blogs.json")

    blog_files = sorted([f for f in os.listdir(BLOG_DIR) if f.endswith('.html')])
    print(f"Found {len(blog_files)} blog HTML files")

    added = 0
    skipped = 0
    no_data = 0

    for filename in blog_files:
        filepath = os.path.join(BLOG_DIR, filename)
        bid = filename.replace('.html', '')

        if bid not in blog_data_lookup:
            no_data += 1

        if add_schema_to_file(filepath, blog_data_lookup):
            added += 1
        else:
            skipped += 1

    print(f"\nResults:")
    print(f"  Schema added: {added}")
    print(f"  Already had schema (skipped): {skipped}")
    print(f"  Posts not in blogs.json (used HTML fallback): {no_data}")
    print(f"  Total processed: {added + skipped}")

if __name__ == '__main__':
    main()
