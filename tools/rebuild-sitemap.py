#!/usr/bin/env python3
"""
rebuild-sitemap.py — Regenerate sitemap.xml including all blog posts
and content pages. Excludes templates, CSS/JS, data files.
"""
import os
import json
from datetime import datetime

ROOT = os.path.join(os.path.dirname(__file__), '..')
BASE_URL = 'https://www.billlayneinsurance.com'
TODAY = datetime.now().strftime('%Y-%m-%d')

# Directories/files to exclude
EXCLUDE_DIRS = {
    'css', 'js', 'data', 'tools', 'node_modules', '.git', '.claude',
    'auto-center/Logos', 'Logos', 'fonts', 'images'
}

EXCLUDE_FILES = {
    'blog-template.html', 'sample-blog-post.html', '404.html',
    'sw.js', 'manifest.json', 'robots.txt', 'sitemap.xml',
    'CNAME', '.nojekyll'
}

# Priority rules
def get_priority(rel_path):
    if rel_path == 'index.html' or rel_path == '':
        return '1.0'
    # Main section pages
    main_pages = [
        'areas-we-serve.html', 'get-quote.html', 'auto-quote.html',
        'contact-us/', 'auto-center/', 'home-insurance/',
        'service-center/', 'carriers/', 'resources/',
        'claims-center/', 'espanol/', 'blog/index.html'
    ]
    for mp in main_pages:
        if rel_path == mp or rel_path.rstrip('/') + '/' == mp:
            return '0.9'
    # Blog posts
    if 'blog/blogs/' in rel_path:
        return '0.7'
    # Community pages
    if 'community/' in rel_path:
        return '0.7'
    # Town/city pages
    if rel_path.startswith('save-in-') or rel_path in ['king.html', 'pilot-mountain.html']:
        return '0.8'
    return '0.8'

def get_changefreq(rel_path):
    if rel_path == 'index.html':
        return 'weekly'
    if 'blog/blogs/' in rel_path:
        return 'monthly'
    return 'weekly'

def should_exclude(rel_path):
    parts = rel_path.replace('\\', '/').split('/')
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    basename = os.path.basename(rel_path)
    if basename in EXCLUDE_FILES:
        return True
    if basename.startswith('.'):
        return True
    return False

def collect_pages():
    pages = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Skip excluded dirs
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith('.')]

        for fname in filenames:
            if not fname.endswith('.html'):
                continue
            full_path = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(full_path, ROOT).replace('\\', '/')

            if should_exclude(rel_path):
                continue

            # Convert to URL
            if rel_path == 'index.html':
                url = BASE_URL + '/'
            elif rel_path.endswith('/index.html'):
                url = BASE_URL + '/' + rel_path.replace('/index.html', '/')
            else:
                url = BASE_URL + '/' + rel_path.replace('.html', '')

            pages.append({
                'url': url,
                'priority': get_priority(rel_path),
                'changefreq': get_changefreq(rel_path),
                'lastmod': TODAY
            })

    return pages

def try_get_blog_date(rel_path):
    """Try to get date from blogs.json for blog posts."""
    data_file = os.path.join(ROOT, 'blog', 'data', 'blogs.json')
    if not os.path.exists(data_file):
        return None
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            blogs = json.load(f)
        basename = os.path.basename(rel_path).replace('.html', '')
        for blog in blogs:
            if blog.get('id') == basename:
                return blog.get('date', TODAY)
    except Exception:
        pass
    return None

def generate_sitemap(pages):
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n'
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n'

    # Sort: homepage first, then by priority desc, then alphabetically
    pages.sort(key=lambda p: (-float(p['priority']), p['url']))

    for page in pages:
        xml += '  <url>\n'
        xml += f'    <loc>{page["url"]}</loc>\n'
        xml += f'    <lastmod>{page["lastmod"]}</lastmod>\n'
        xml += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
        xml += f'    <priority>{page["priority"]}</priority>\n'
        xml += '  </url>\n'

    xml += '</urlset>\n'
    return xml

def main():
    pages = collect_pages()
    print(f"Found {len(pages)} pages to include in sitemap")

    # Count by type
    blog_count = sum(1 for p in pages if '/blog/blogs/' in p['url'])
    main_count = sum(1 for p in pages if float(p['priority']) >= 0.9)
    print(f"  Main pages (0.9+): {main_count}")
    print(f"  Blog posts: {blog_count}")
    print(f"  Other pages: {len(pages) - blog_count - main_count}")

    sitemap_xml = generate_sitemap(pages)
    output_path = os.path.join(ROOT, 'sitemap.xml')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)

    print(f"\nSitemap written to {output_path}")
    print(f"Total URLs: {len(pages)}")

if __name__ == '__main__':
    main()
