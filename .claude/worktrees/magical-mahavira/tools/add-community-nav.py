"""Add 'Community' link to desktop drawer menu and mobile dock menu on all site pages."""
import os
import re

BASE = r'C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE'
SKIP_DIRS = {'.git', 'node_modules', '.claude', 'tools', 'community'}

# Pattern to find the Contact Us link in the desktop drawer (before it, we insert Community)
# Desktop drawer: look for the Contact Us line, insert Community before it
DESKTOP_COMMUNITY_LINK_ABS = '<a href="../community/" class="block p-3 rounded-xl hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-3"><i class="fas fa-mountain w-6 text-amber-500"></i> Community</a>'
DESKTOP_COMMUNITY_LINK_ROOT = '<a href="community/" class="block p-3 rounded-xl hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-3"><i class="fas fa-mountain w-6 text-amber-500"></i> Community</a>'

# Mobile dock: look for Contact Us line, insert Community before it
MOBILE_COMMUNITY_LINK = '<li><a href="https://www.billlayneinsurance.com/community/"><span class="menu-icon amber"><i class="fas fa-mountain"></i></span> Community <i class="fas fa-chevron-right menu-arrow"></i></a></li>'

files_to_check = []
for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in files:
        if f.endswith('.html'):
            files_to_check.append(os.path.join(root, f))

changed = []
for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        content = fh.read()

    original = content

    # Skip if already has community link
    if 'community/' in content and 'fa-mountain' in content:
        continue

    # Determine relative path for desktop drawer
    rel_dir = os.path.relpath(os.path.dirname(filepath), BASE)
    if rel_dir == '.':
        community_href = 'community/'
    else:
        depth = len(rel_dir.replace('\\', '/').split('/'))
        community_href = '../' * depth + 'community/'

    desktop_link = f'<a href="{community_href}" class="block p-3 rounded-xl hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-3"><i class="fas fa-mountain w-6 text-amber-500"></i> Community</a>'

    # === DESKTOP DRAWER ===
    # Insert Community before Contact Us in the drawer
    # Pattern: find the Contact Us drawer link
    contact_pattern = r'(<a href="[^"]*contact-us\.html"[^>]*class="block p-3 rounded-xl[^"]*"[^>]*>.*?Contact Us</a>)'
    match = re.search(contact_pattern, content, re.DOTALL)
    if match:
        insert_pos = match.start()
        # Find the beginning of the line (after the last newline before match)
        line_start = content.rfind('\n', 0, insert_pos)
        indent = ''
        if line_start >= 0:
            # Get indentation
            remaining = content[line_start+1:insert_pos]
            indent = remaining[:len(remaining) - len(remaining.lstrip())]
        content = content[:insert_pos] + desktop_link + '\n' + indent + content[insert_pos:]

    # === MOBILE DOCK MENU ===
    # Insert Community before Contact Us in the mobile panel
    mobile_contact_pattern = r'(<li><a href="https://www\.billlayneinsurance\.com/contact-us\.html">)'
    match2 = re.search(mobile_contact_pattern, content)
    if match2:
        insert_pos2 = match2.start()
        line_start2 = content.rfind('\n', 0, insert_pos2)
        indent2 = ''
        if line_start2 >= 0:
            remaining2 = content[line_start2+1:insert_pos2]
            indent2 = remaining2[:len(remaining2) - len(remaining2.lstrip())]
        content = content[:insert_pos2] + MOBILE_COMMUNITY_LINK + '\n' + indent2 + content[insert_pos2:]

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as fh:
            fh.write(content)
        rel = os.path.relpath(filepath, BASE)
        print(f'Updated: {rel}')
        changed.append(rel)

print(f'\nTotal: {len(changed)} files updated')
