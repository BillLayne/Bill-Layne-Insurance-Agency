#!/usr/bin/env python3
"""Rebuild the two copies of the blog list in blog/index.html from blog/data/blogs.json.

blog/index.html carries the post list twice besides the JS-rendered grid:
  1. <script>window.__BLOG_DATA__ = [...];</script>  - what blog/app.js renders
  2. the <noscript> "All Blog Posts" <ul>             - what crawlers without JS see
Both used to be patched by hand on every publish and drifted (duplicates,
posts that canonicalise elsewhere, missing posts). This script regenerates both
from blogs.json, the single source of truth, so they cannot drift.

Noscript links use the canonical form /blog/blogs/<slug> (no .html, which would
cost a 308 hop). Entries pointing outside /blog/blogs/ (e.g. a pillar page)
keep their URL.

Run:  python tools/sync-blog-index.py           (rewrites blog/index.html)
      python tools/sync-blog-index.py --check   (exit 1 if either copy has drifted)
Run it after every change to blogs.json.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'blog', 'data', 'blogs.json')
INDEX = os.path.join(ROOT, 'blog', 'index.html')


def href(entry):
    url = entry['url']
    if url.startswith('./blogs/'):
        return '/blog/blogs/' + re.sub(r'\.html$', '', url[len('./blogs/'):])
    return url


def main():
    check = '--check' in sys.argv
    posts = json.load(open(DATA, encoding='utf-8'))
    ids = [p['id'] for p in posts]
    dup_ids = sorted({i for i in ids if ids.count(i) > 1})
    if dup_ids:
        sys.exit(f'blogs.json has duplicate ids: {dup_ids}')
    src = open(INDEX, encoding='utf-8', newline='').read()
    out = src

    # 1. embedded data
    m = re.search(r'(<script>window\.__BLOG_DATA__ = )(\[[\s\S]*?\])(;</script>)', out)
    if not m:
        sys.exit('window.__BLOG_DATA__ script not found in blog/index.html')
    data = json.dumps(posts, separators=(',', ':'), ensure_ascii=False)
    if '</' in data:
        sys.exit('blogs.json contains "</", which would break the inline script')
    out = out[:m.start(2)] + data + out[m.end(2):]

    # 2. noscript list
    ns = out.index('<noscript>')
    ul_open = out.index('<ul>', ns)
    ul_close = out.index('</ul>', ul_open)
    if ul_close > out.index('</noscript>', ns):
        sys.exit('<ul> not found inside the first <noscript> block')
    first_li = out.index('<li>', ul_open)
    indent = out[out.rfind('\n', 0, first_li) + 1:first_li]
    close_indent = out[out.rfind('\n', 0, ul_close) + 1:ul_close]
    seen, lines = set(), []
    for p in posts:
        h = href(p)
        if h in seen:
            continue
        seen.add(h)
        lines.append(f'{indent}<li><a href="{html.escape(h, quote=True)}">{html.escape(p["title"], quote=False)}</a></li>')
    out = out[:ul_open + len('<ul>')] + '\n' + '\n'.join(lines) + '\n' + close_indent + out[ul_close:]

    if out == src:
        print(f'blog/index.html in sync ({len(posts)} posts, {len(lines)} noscript links)')
        return
    if check:
        print('blog/index.html has drifted from blogs.json - run: python tools/sync-blog-index.py')
        sys.exit(1)
    open(INDEX, 'w', encoding='utf-8', newline='').write(out)
    print(f'blog/index.html rebuilt: {len(posts)} posts embedded, {len(lines)} noscript links')


if __name__ == '__main__':
    main()
