#!/usr/bin/env python3
"""Move base64-embedded images out of HTML files onto img.billlayneinsurance.com.

Blog posts generated with inline `data:image/...;base64` art weigh 5-17 MB each
(89 such posts on 2026-09-02, 481 MB in total). This script decodes every
embedded raster image, re-encodes it as WebP, uploads it to the BLI Image Host
(the same workflow blog/HOW-TO-ADD-A-BLOG.md prescribes), and rewrites the
<img> tag to the hosted URL with width/height and lazy-loading attributes.

Usage:
  python tools/extract-base64-images.py --dry-run [files...]    # report only
  python tools/extract-base64-images.py [files...]              # do it
  With no file arguments every tracked *.html file is scanned.

Needs the image-host access code in the BLI_IMAGE_HOST_CODE environment
variable. A JSON log of every replacement is written next to the script as
extract-base64-images.log.json (append-only) so a bad run can be traced.
"""
import base64
import io
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = 'https://img.billlayneinsurance.com'
LABEL = 'blog-base64-sweep-2026-09'
MIN_BYTES = 20_000          # leave tiny inline icons alone
MAX_WIDTH = 1600
QUALITY = 82
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36 BLI-image-sweep'
LOG = os.path.join(ROOT, 'tools', 'extract-base64-images.log.json')

IMG_RE = re.compile(r'<img\b[^>]*>', re.I | re.S)
DATA_RE = re.compile(r'src\s*=\s*"data:image/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]+)"', re.I)


def slugify(text, fallback):
    text = re.sub(r'<[^>]+>', '', text or '')
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    slug = slug[:40].rstrip('-')
    return slug or fallback


def to_webp(raw):
    im = Image.open(io.BytesIO(raw))
    if im.mode not in ('RGB', 'RGBA'):
        im = im.convert('RGBA' if 'A' in im.getbands() or im.mode == 'P' else 'RGB')
    if im.width > MAX_WIDTH:
        im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, 'WEBP', quality=QUALITY, method=6)
    return out.getvalue(), im.width, im.height


def upload(data, filename):
    url = f'{HOST}/api/upload?filename={urllib.request.quote(filename)}&label={LABEL}'
    req = urllib.request.Request(url, data=data, method='POST', headers={
        'x-access-code': os.environ['BLI_IMAGE_HOST_CODE'],
        'content-type': 'image/webp',
        'user-agent': UA,
    })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = json.loads(resp.read().decode('utf-8'))
                return body['url']
        except Exception as exc:  # noqa: BLE001
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))
            print(f'    retry upload ({exc})', file=sys.stderr)


def set_attr(tag, name, value):
    if re.search(rf'\b{name}\s*=', tag, re.I):
        return tag
    return tag[:-1].rstrip('/').rstrip() + f' {name}="{value}"' + ('/>' if tag.endswith('/>') else '>')


ANY_DATA_RE = re.compile(r'data:image/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=]+)', re.I)


def process(path, dry):
    with open(path, encoding='utf-8') as fh:
        html = fh.read()
    if 'base64,' not in html:
        return None
    page_slug = os.path.splitext(os.path.basename(path))[0]
    if page_slug == 'index':
        page_slug = os.path.basename(os.path.dirname(path))
    rel = os.path.relpath(path, ROOT).replace('\\', '/')

    # Pass 1: every distinct big blob gets converted and uploaded exactly once.
    # The same PNG is often pasted into the hero <img>, og/twitter:image and the
    # JSON-LD, so dedupe by the base64 text itself.
    blobs = {}      # b64 text -> {'url','w','h','bytes_in','bytes_out','name'}
    order = []
    # Name each file after the alt text of the <img> that carries the blob.
    alts = {}
    for tag in IMG_RE.findall(html):
        dm = DATA_RE.search(tag)
        am = re.search(r'alt\s*=\s*"([^"]*)"', tag, re.I)
        if dm and am and am.group(1).strip():
            alts.setdefault(re.sub(r'\s+', '', dm.group(2)), am.group(1))
    for m in ANY_DATA_RE.finditer(html):
        b64 = m.group(2)
        if b64 in blobs or len(b64) * 3 // 4 < MIN_BYTES:
            continue
        name = slugify(alts.get(b64, ''), page_slug) + '.webp'
        blobs[b64] = {'name': name, 'raw': base64.b64decode(b64)}
        order.append(b64)
    if not blobs:
        return None
    replacements = []
    for b64 in order:
        entry = blobs[b64]
        webp, w, h = to_webp(entry['raw'])
        hosted = None if dry else upload(webp, entry['name'])
        entry.update({'url': hosted or 'HOSTED-URL', 'w': w, 'h': h, 'bytes_out': len(webp), 'bytes_in': len(entry['raw'])})
        replacements.append({'file': rel, 'name': entry['name'], 'bytes_in': entry['bytes_in'],
                             'bytes_out': len(webp), 'w': w, 'h': h, 'url': hosted})

    # Pass 2: rewrite <img> tags (adds dimensions + lazy-loading), then any leftover
    # occurrence (meta tags, JSON-LD, inline styles) gets the plain URL swap.
    first_img_seen = [False]

    def fix_img(match):
        tag = match.group(0)
        dm = DATA_RE.search(tag)
        if not dm:
            first_img_seen[0] = True
            return tag
        b64 = re.sub(r'\s+', '', dm.group(2))
        entry = blobs.get(b64)
        if not entry:
            return tag
        new = tag[:dm.start()] + f'src="{entry["url"]}"' + tag[dm.end():]
        new = set_attr(new, 'width', str(entry['w']))
        new = set_attr(new, 'height', str(entry['h']))
        if first_img_seen[0]:
            new = set_attr(new, 'loading', 'lazy')
            new = set_attr(new, 'decoding', 'async')
        else:
            new = set_attr(new, 'fetchpriority', 'high')
        first_img_seen[0] = True
        return new

    new_html = IMG_RE.sub(fix_img, html)
    new_html = ANY_DATA_RE.sub(lambda m: blobs[m.group(2)]['url'] if m.group(2) in blobs else m.group(0), new_html)
    if not dry:
        with open(path, 'w', encoding='utf-8', newline='') as fh:
            fh.write(new_html)
        with open(LOG, 'a', encoding='utf-8') as fh:
            for r in replacements:
                fh.write(json.dumps(r) + '\n')
    return replacements, len(html), len(new_html)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    if not dry and 'BLI_IMAGE_HOST_CODE' not in os.environ:
        sys.exit('set BLI_IMAGE_HOST_CODE (image host access code) first')
    if args:
        files = args
    else:
        files = [f for f in subprocess.run(['git', 'ls-files', '*.html'], capture_output=True, text=True, cwd=ROOT).stdout.split('\n')
                 if f and not f.startswith('.claude')]
    total_in = total_out = 0
    for f in files:
        path = f if os.path.isabs(f) else os.path.join(ROOT, f)
        try:
            result = process(path, dry)
        except Exception as exc:  # noqa: BLE001
            print(f'FAILED {f}: {exc}', file=sys.stderr)
            continue
        if not result:
            continue
        reps, before, after = result
        total_in += before
        total_out += after
        print(f'{f}: {len(reps)} images, {before/1e6:.1f} MB -> {after/1e3:.0f} KB')
        for r in reps:
            print(f'    {r["name"]} {r["w"]}x{r["h"]} {r["bytes_in"]/1e3:.0f} KB -> {r["bytes_out"]/1e3:.0f} KB {r["url"] or ""}')
    print(f'TOTAL html {total_in/1e6:.1f} MB -> {total_out/1e6:.2f} MB ({"dry run" if dry else "written"})')


if __name__ == '__main__':
    main()
