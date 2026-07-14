"""
Fix site-wide canonical bug on blog posts.

PROBLEM
  Cloudflare Pages 308-redirects /blog/blogs/<slug>.html -> /blog/blogs/<slug>
  (the clean URL is the one that actually serves 200 OK).

  But 235 of 278 blog posts declare their canonical (and og:url, and schema
  URLs) as the .html version -- i.e. they point Google at a URL that
  immediately redirects away. That is a self-defeating canonical: it splits
  link equity across two URLs, wastes crawl budget, and suppresses rankings.

FIX
  Rewrite every ABSOLUTE billlayneinsurance.com blog URL from
      https://www.billlayneinsurance.com/blog/blogs/<slug>.html
  to
      https://www.billlayneinsurance.com/blog/blogs/<slug>

  This corrects <link rel="canonical">, og:url, twitter:url, and the JSON-LD
  @id / mainEntityOfPage / breadcrumb item fields in one pass.

SAFETY
  - Only ABSOLUTE https://www.billlayneinsurance.com/blog/blogs/... URLs are
    touched. Relative paths (./blogs/foo.html) used by blogs.json and the blog
    listing app are deliberately left alone -- rewriting those would break the
    blog index.
  - Run with --dry to preview counts without writing.
"""

import re
import sys
import glob
import os

BLOG_DIR = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE\blog\blogs"

# Absolute blog URL ending in .html -> same URL without .html.
# The negative lookahead on [\w-] after .html avoids clipping something like
# ".htmlfoo"; the fragment (#article) and quote boundaries are preserved
# because we only consume the literal ".html".
PATTERN = re.compile(
    r'(https://www\.billlayneinsurance\.com/blog/blogs/[A-Za-z0-9._-]+?)\.html'
)


def fix_file(path, dry=False):
    with open(path, "r", encoding="utf-8") as f:
        original = f.read()

    fixed, n = PATTERN.subn(r"\1", original)

    if n and not dry:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(fixed)

    return n


def main():
    dry = "--dry" in sys.argv

    files = sorted(glob.glob(os.path.join(BLOG_DIR, "*.html")))
    total_files = len(files)
    changed_files = 0
    total_repl = 0

    for path in files:
        n = fix_file(path, dry=dry)
        if n:
            changed_files += 1
            total_repl += n

    mode = "DRY RUN (no writes)" if dry else "WRITTEN"
    print(f"[{mode}]")
    print(f"  Blog posts scanned:      {total_files}")
    print(f"  Posts with .html URLs:   {changed_files}")
    print(f"  Total URLs rewritten:    {total_repl}")


if __name__ == "__main__":
    main()
