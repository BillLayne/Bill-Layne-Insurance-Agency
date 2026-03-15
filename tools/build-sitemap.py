#!/usr/bin/env python3
"""Build comprehensive sitemap.xml for billlayneinsurance.com"""

import os
import re
from datetime import date

BASE_URL = "https://www.billlayneinsurance.com"
TODAY = "2026-03-14"
SITE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def find_html_files():
    """Find all HTML files, excluding .claude and node_modules."""
    all_files = []
    for root, dirs, files in os.walk(SITE_ROOT):
        rel_root = os.path.relpath(root, SITE_ROOT).replace(os.sep, "/")
        parts = rel_root.split("/")
        if ".claude" in parts or "node_modules" in parts:
            continue
        for f in files:
            if f.endswith(".html"):
                if rel_root == ".":
                    path = f
                else:
                    path = rel_root + "/" + f
                all_files.append(path)
    return all_files

def check_exclusions(files):
    """Check files for noindex or meta refresh redirect."""
    noindex = set()
    redirect = set()
    for fpath in files:
        full = os.path.join(SITE_ROOT, fpath.replace("/", os.sep))
        try:
            with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read(5000)
                if re.search(r"noindex", content, re.IGNORECASE):
                    noindex.add(fpath)
                if re.search(r'http-equiv=["\']refresh["\']', content, re.IGNORECASE):
                    redirect.add(fpath)
        except:
            pass
    return noindex, redirect

def path_to_url(fpath):
    """Convert file path to canonical URL."""
    # index.html -> directory URL
    if fpath == "index.html":
        return BASE_URL + "/"
    if fpath.endswith("/index.html"):
        return BASE_URL + "/" + fpath[:-len("/index.html")] + "/"
    # .html files -> without extension for clean URLs, unless in blog/blogs/
    if fpath.startswith("blog/blogs/"):
        return BASE_URL + "/" + fpath
    # For other .html files, keep the extension (they're served as-is)
    return BASE_URL + "/" + fpath

def get_priority_and_freq(fpath):
    """Determine priority and changefreq based on page type."""
    # Homepage
    if fpath == "index.html":
        return "1.0", "weekly"

    # Main section pages
    main_sections = [
        "auto-center/index.html",
        "home-insurance/index.html",
        "contact-us.html",
        "get-quote.html",
        "claims-center/index.html",
        "service-center.html",
        "resources/index.html",
        "areas-we-serve.html",
        "blog/index.html",
        "espanol/index.html",
        "auto-center/carriers/index.html",
    ]
    if fpath in main_sections:
        return "0.9", "weekly"

    # Quote pages
    if fpath in ["auto-quote.html", "home-quote.html"]:
        return "0.9", "weekly"

    # Auto center sub-pages
    if fpath.startswith("auto-center/"):
        return "0.8", "weekly"

    # Home insurance sub-pages
    if fpath.startswith("home-insurance/"):
        return "0.8", "weekly"

    # Claims center sub-pages
    if fpath.startswith("claims-center/"):
        return "0.8", "monthly"

    # Resources sub-pages
    if fpath.startswith("resources/"):
        return "0.8", "monthly"

    # Blog posts (blog/blogs/)
    if fpath.startswith("blog/blogs/"):
        return "0.7", "monthly"

    # Community pages
    if fpath.startswith("community/"):
        if fpath == "community/index.html":
            return "0.7", "monthly"
        return "0.6", "monthly"

    # Save-in location pages
    if fpath.startswith("save-in-"):
        return "0.5", "monthly"

    # Insurance city pages
    if fpath.startswith("insurance-") and fpath != "insurance-quiz.html":
        return "0.5", "monthly"

    # Tools and calculators
    if fpath in ["auto-coverage-checkup.html", "home-insurance-evaluator.html",
                  "insurance-quiz.html", "risk-assessment.html", "umbrella-policy-calculator.html"]:
        return "0.8", "monthly"

    # Product pages
    if fpath in ["auto-insurance.html", "homeowners-insurance.html", "business-insurance/index.html"]:
        return "0.8", "monthly"

    # Privacy/terms
    if fpath.startswith("privacy") or fpath.startswith("terms"):
        return "0.3", "yearly"

    # Default
    return "0.5", "monthly"

def build_sitemap():
    all_files = find_html_files()
    noindex, redirect = check_exclusions(all_files)

    # Manual excludes
    manual_excludes = {
        "blog/blog-template.html",
        "blog/sample-blog-post.html",
        "resources/consistent-header.html",
        "_frog/index.html",
        "blog.html",  # duplicate of blog/index.html
    }
    # Exclude entire directories that are dev/utility
    dev_dirs = ["Insurance-Contact-Information-main/"]
    for f in list(all_files):
        for d in dev_dirs:
            if f.startswith(d):
                manual_excludes.add(f)

    excluded = noindex | redirect | manual_excludes
    indexable = sorted([f for f in all_files if f not in excluded])
    # Put homepage first
    if "index.html" in indexable:
        indexable.remove("index.html")
        indexable.insert(0, "index.html")

    # Build XML
    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    lines.append('        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"')
    lines.append('        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9')
    lines.append('        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">')

    for fpath in indexable:
        url = path_to_url(fpath)
        priority, changefreq = get_priority_and_freq(fpath)
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append(f"    <lastmod>{TODAY}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    sitemap_path = os.path.join(SITE_ROOT, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Indexable pages written to sitemap.xml: {len(indexable)}")
    print(f"Excluded (noindex): {len(noindex)}")
    print(f"Excluded (redirect): {len(redirect)}")
    print(f"Excluded (manual): {len(manual_excludes)}")
    print(f"Total excluded (union): {len(excluded)}")

    # Print breakdown
    blogs = [f for f in indexable if f.startswith("blog/blogs/")]
    community = [f for f in indexable if f.startswith("community/")]
    auto_center = [f for f in indexable if f.startswith("auto-center/")]
    home_ins = [f for f in indexable if f.startswith("home-insurance/")]
    resources = [f for f in indexable if f.startswith("resources/")]
    claims = [f for f in indexable if f.startswith("claims-center/")]
    saves = [f for f in indexable if f.startswith("save-in-")]

    print(f"\nBreakdown:")
    print(f"  Blog articles: {len(blogs)}")
    print(f"  Community pages: {len(community)}")
    print(f"  Auto center: {len(auto_center)}")
    print(f"  Home insurance: {len(home_ins)}")
    print(f"  Resources: {len(resources)}")
    print(f"  Claims center: {len(claims)}")
    print(f"  Save-in pages: {len(saves)}")
    print(f"  Other: {len(indexable) - len(blogs) - len(community) - len(auto_center) - len(home_ins) - len(resources) - len(claims) - len(saves)}")

if __name__ == "__main__":
    build_sitemap()
