"""
Bulk-add Home Insurance sub-menu items (Surry County Guide + Renters Insurance)
to all HTML pages that are missing them, in both the desktop drawer and mobile dock menus.

Usage:
    python tools/add-home-submenu.py --dry-run   # Preview only
    python tools/add-home-submenu.py              # Apply changes
"""

import os
import re
import sys
import glob

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY_RUN = "--dry-run" in sys.argv

SKIP_MARKER = "Surry County Guide"
SKIP_DIRS = [".claude", "node_modules", ".git"]

# ── Mobile dock: universal absolute-URL pattern ──────────────────────────
MOBILE_FIND = '<li><a href="https://www.billlayneinsurance.com/home-insurance/"><span class="menu-icon green"><i class="fas fa-house"></i></span> Home Insurance <i class="fas fa-chevron-right menu-arrow"></i></a></li>'

MOBILE_INSERT = """\
            <li><a href="https://www.billlayneinsurance.com/best-home-insurance-surry-county-nc.html" style="padding-left:2.5rem;font-size:0.85em"><span class="menu-icon green" style="width:22px;height:22px;font-size:10px"><i class="fas fa-map-marker-alt"></i></span> Surry County Guide <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/renters-insurance-surry-county-nc.html" style="padding-left:2.5rem;font-size:0.85em"><span class="menu-icon green" style="width:22px;height:22px;font-size:10px"><i class="fas fa-key"></i></span> Renters Insurance <i class="fas fa-chevron-right menu-arrow"></i></a></li>"""


def get_relative_prefix(filepath):
    """Determine the ../ prefix needed for root-level page links."""
    rel = os.path.relpath(filepath, REPO_ROOT)
    depth = rel.replace("\\", "/").count("/")
    if depth == 0:
        return ""
    return "../" * depth


def make_standard_sub_items(prefix):
    """Sub-items for the standard desktop drawer pattern (group block p-2.5 with div icons)."""
    return f"""\
            <a href="{prefix}best-home-insurance-surry-county-nc.html" class="group block p-2.5 pl-8 rounded-xl hover:bg-slate-50 text-slate-500 font-semibold flex items-center gap-3 transition-colors text-sm"><div class="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform"><i class="fas fa-map-marker-alt text-xs"></i></div> Surry County Guide</a>
            <a href="{prefix}renters-insurance-surry-county-nc.html" class="group block p-2.5 pl-8 rounded-xl hover:bg-slate-50 text-slate-500 font-semibold flex items-center gap-3 transition-colors text-sm"><div class="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><i class="fas fa-key text-xs"></i></div> Renters Insurance</a>"""


def make_older_sub_items(prefix):
    """Sub-items for the older desktop drawer pattern (block p-3 with inline icons)."""
    return f"""\
            <a href="{prefix}best-home-insurance-surry-county-nc.html" class="block p-3 pl-8 rounded-xl hover:bg-slate-50 text-slate-500 font-medium flex items-center gap-3 text-sm"><i class="fas fa-map-marker-alt w-5 text-teal-500 text-xs"></i> Surry County Guide</a>
            <a href="{prefix}renters-insurance-surry-county-nc.html" class="block p-3 pl-8 rounded-xl hover:bg-slate-50 text-slate-500 font-medium flex items-center gap-3 text-sm"><i class="fas fa-key w-5 text-emerald-500 text-xs"></i> Renters Insurance</a>"""


def make_blog_sub_items(prefix):
    """Sub-items for the blog index desktop drawer pattern."""
    return f"""\
            <a href="{prefix}best-home-insurance-surry-county-nc.html" class="block py-3 px-2 pl-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-medium border-b border-gray-200 rounded transition-all text-sm">
                <i class="fas fa-map-marker-alt mr-3 w-4 text-xs"></i>Surry County Guide</a>
            <a href="{prefix}renters-insurance-surry-county-nc.html" class="block py-3 px-2 pl-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-medium border-b border-gray-200 rounded transition-all text-sm">
                <i class="fas fa-key mr-3 w-4 text-xs"></i>Renters Insurance</a>"""


def detect_drawer_pattern(line):
    """Detect which desktop drawer pattern is used on the Home Insurance line."""
    if "group block p-2.5" in line:
        return "standard"
    elif "block py-3 px-2" in line:
        return "blog"
    elif "block p-3" in line:
        return "older"
    else:
        return "standard"  # fallback


def process_file(filepath):
    """Process a single HTML file. Returns True if modified."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        print(f"  SKIP (read error): {filepath} — {e}")
        return False

    # Already has sub-items
    if SKIP_MARKER in content:
        return False

    # Must have a Home Insurance menu link
    if "fa-house" not in content:
        return False

    original = content
    prefix = get_relative_prefix(filepath)
    modified = False

    # ── 1. Desktop drawer: insert after the fa-house line ──
    lines = content.split("\n")
    new_lines = []
    for line in lines:
        new_lines.append(line)
        # Match the desktop drawer Home Insurance link (contains fa-house but NOT in mobile dock)
        if "fa-house" in line and "menu-icon" not in line and SKIP_MARKER not in line:
            pattern = detect_drawer_pattern(line)
            if pattern == "standard":
                new_lines.append(make_standard_sub_items(prefix))
            elif pattern == "blog":
                new_lines.append(make_blog_sub_items(prefix))
            elif pattern == "older":
                new_lines.append(make_older_sub_items(prefix))
            modified = True

    content = "\n".join(new_lines)

    # ── 2. Mobile dock: insert after the Home Insurance <li> ──
    if MOBILE_FIND in content:
        content = content.replace(
            MOBILE_FIND,
            MOBILE_FIND + "\n" + MOBILE_INSERT,
            1  # only first occurrence
        )
        modified = True

    if modified and content != original:
        if not DRY_RUN:
            with open(filepath, "w", encoding="utf-8", newline="") as f:
                f.write(content)
        return True

    return False


def main():
    if DRY_RUN:
        print("=== DRY RUN MODE (no files will be written) ===\n")
    else:
        print("=== APPLYING CHANGES ===\n")

    # Collect all HTML files, excluding worktrees and other skip dirs
    html_files = []
    for root, dirs, files in os.walk(REPO_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))

    html_files.sort()
    updated = []
    skipped_has_marker = 0
    skipped_no_menu = 0

    for fp in html_files:
        rel = os.path.relpath(fp, REPO_ROOT)
        if SKIP_MARKER in open(fp, "r", encoding="utf-8", errors="replace").read():
            skipped_has_marker += 1
            continue
        if "fa-house" not in open(fp, "r", encoding="utf-8", errors="replace").read():
            skipped_no_menu += 1
            continue

        result = process_file(fp)
        if result:
            updated.append(rel)
            print(f"  {'[DRY] ' if DRY_RUN else ''}Updated: {rel}")

    print(f"\n{'='*60}")
    print(f"Total HTML files scanned: {len(html_files)}")
    print(f"Already had sub-items:    {skipped_has_marker}")
    print(f"No Home Insurance menu:   {skipped_no_menu}")
    print(f"Files updated:            {len(updated)}")
    if DRY_RUN:
        print("\nRe-run without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
