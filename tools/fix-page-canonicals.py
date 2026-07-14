"""
Same canonical bug as the blog posts, but for root-level + /resources pages.

Cloudflare Pages 308-redirects /foo.html -> /foo (clean URL serves 200).
These pages declare canonical/og:url as the .html version, i.e. they point
Google at a URL that immediately redirects away.

Fix: strip ".html" from absolute billlayneinsurance.com canonical/og:url/
twitter:url/schema URLs on the affected pages.

SKIPPED: toast.html -- that page is explicitly 301'd to the homepage in
_redirects (it is a retired page), so its canonical is moot and rewriting it
would just be noise.
"""

import re
import sys
import glob
import os

ROOT = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE"

# Retired page: /toast.html -> / (301). Leave alone.
SKIP = {"toast.html"}

# Absolute billlayneinsurance.com URL ending in .html -> drop the .html.
# Deliberately does NOT touch relative hrefs (./foo.html) used for in-page nav.
PATTERN = re.compile(
    r'(https://www\.billlayneinsurance\.com/[A-Za-z0-9._/-]+?)\.html'
)


def main():
    dry = "--dry" in sys.argv

    targets = (
        glob.glob(os.path.join(ROOT, "*.html"))
        + glob.glob(os.path.join(ROOT, "resources", "*.html"))
    )

    changed_files = 0
    total_repl = 0

    for path in sorted(targets):
        if os.path.basename(path) in SKIP:
            continue

        with open(path, "r", encoding="utf-8") as f:
            original = f.read()

        # Only rewrite if this page actually declares a .html canonical --
        # avoids churning files that merely link to a .html page.
        if not re.search(r'rel="canonical" href="[^"]*\.html"', original):
            continue

        fixed, n = PATTERN.subn(r"\1", original)

        if n:
            changed_files += 1
            total_repl += n
            if not dry:
                with open(path, "w", encoding="utf-8", newline="") as f:
                    f.write(fixed)

    mode = "DRY RUN (no writes)" if dry else "WRITTEN"
    print(f"[{mode}]")
    print(f"  Pages fixed:          {changed_files}")
    print(f"  Total URLs rewritten: {total_repl}")


if __name__ == "__main__":
    main()
