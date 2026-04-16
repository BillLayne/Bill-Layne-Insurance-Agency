"""Propagate accessibility fixes from index.html to major landing pages."""
import os
import re

TARGET_FILES = [
    'auto-center/index.html',
    'home-insurance/index.html',
    'claims-center/index.html',
    'service-center.html',
    'areas-we-serve.html',
    'contact-us/index.html',
    'resources/index.html',
    'blog/index.html',
]

# Pattern: (description, find, replace)
FIXES = [
    # 1. Mobile drawer close button — add aria-label and aria-hidden on icon
    (
        'Mobile drawer close button aria-label',
        re.compile(
            r'<button id="menu-close"([^>]*?)>\s*<i class="fas fa-times"></i>\s*</button>',
            re.DOTALL
        ),
        r'<button id="menu-close" aria-label="Close menu"\1>\n                <i class="fas fa-times" aria-hidden="true"></i>\n            </button>',
    ),
    # 2. Mobile dock close button
    (
        'Mobile dock close button aria-label',
        re.compile(
            r'<button class="menu-close" onclick="toggleMobileDockMenu\(\)"><i class="fas fa-times"></i></button>'
        ),
        '<button class="menu-close" aria-label="Close menu" onclick="toggleMobileDockMenu()"><i class="fas fa-times" aria-hidden="true"></i></button>',
    ),
    # 3. Footer base color upgrade (only matches the homepage-style footer)
    (
        'Footer text-slate-500 → text-slate-400',
        re.compile(r'<footer class="bg-slate-950 text-slate-500 '),
        '<footer class="bg-slate-950 text-slate-400 ',
    ),
    # 4. Footer paragraph opacity-60 (homepage-style)
    (
        'Footer paragraph opacity-60 removed',
        re.compile(r'<p class="text-sm leading-loose opacity-60">Protecting North Carolina'),
        '<p class="text-sm leading-loose">Protecting North Carolina',
    ),
    # 5. Footer ul opacity-60 (Dobson Office column)
    (
        'Footer Dobson ul opacity-60 removed',
        re.compile(r'<ul class="space-y-3 text-sm opacity-60">'),
        '<ul class="space-y-3 text-sm">',
    ),
    # 6. After-hours claims span
    (
        'After-hours claims span opacity-60',
        re.compile(
            r'<span class="text-\[11px\] opacity-60 ml-5">Call your carrier'
        ),
        '<span class="text-xs text-slate-400 ml-5">Call your carrier',
    ),
    # 7. Legal disclaimer contrast
    (
        'Legal disclaimer text-slate-600/opacity-50',
        re.compile(
            r'<p class="text-xs text-slate-600 leading-relaxed text-center opacity-50">Savings are not guaranteed'
        ),
        '<p class="text-xs text-slate-400 leading-relaxed text-center">Savings are not guaranteed',
    ),
    # 8. Footer heading levels: h4 "Bill Layne Insurance" → h3
    (
        'Footer h4 → h3 (agency name)',
        re.compile(
            r'<h4 class="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 tracking-wide uppercase">Bill Layne Insurance</h4>'
        ),
        '<h3 class="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6 tracking-wide uppercase">Bill Layne Insurance</h3>',
    ),
    # 9. Footer h5 Connect → h4
    (
        'Footer h5 Connect → h4',
        re.compile(
            r'<h5 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Connect</h5>'
        ),
        '<h4 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Connect</h4>',
    ),
    # 10. Footer h5 Dobson Office → h4
    (
        'Footer h5 Dobson Office → h4',
        re.compile(
            r'<h5 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Dobson Office'
        ),
        '<h4 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Dobson Office',
    ),
    (
        'Footer h5 Dobson Office closing tag',
        re.compile(r'(Dobson Office[^<]*<span[^<]*</span>)</h5>'),
        r'\1</h4>',
    ),
    # 11. Footer h5 Insurance Guides → h4
    (
        'Footer h5 Insurance Guides → h4',
        re.compile(
            r'<h5 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Insurance Guides</h5>'
        ),
        '<h4 class="text-white font-bold mb-4 sm:mb-6 text-sm uppercase tracking-widest">Insurance Guides</h4>',
    ),
    # 12. Footer h5 Follow Us → h4
    (
        'Footer h5 Follow Us → h4',
        re.compile(
            r'<h5 class="text-white font-bold mt-6 mb-3 text-sm uppercase tracking-widest">Follow Us</h5>'
        ),
        '<h4 class="text-white font-bold mt-6 mb-3 text-sm uppercase tracking-widest">Follow Us</h4>',
    ),
    # 13. Testimonial Verified badge opacity-60 → opacity-80
    (
        'Verified badge opacity 60 → 80',
        re.compile(
            r'<div class="flex items-center gap-1 opacity-60"><img src="https://upload\.wikimedia\.org/wikipedia/commons/c/c1/Google_%22G%22_logo\.svg"'
        ),
        '<div class="flex items-center gap-1 opacity-80"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"',
    ),
]

report = []
for rel_path in TARGET_FILES:
    if not os.path.exists(rel_path):
        report.append(f'{rel_path}: NOT FOUND')
        continue

    with open(rel_path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    original = content

    file_changes = []
    for desc, pattern, replacement in FIXES:
        new_content, count = pattern.subn(replacement, content)
        if count > 0:
            file_changes.append(f'  [{count}] {desc}')
            content = new_content

    if content != original:
        with open(rel_path, 'w', encoding='utf-8') as fp:
            fp.write(content)
        report.append(f'{rel_path}: {len(file_changes)} fixes applied')
        report.extend(file_changes)
    else:
        report.append(f'{rel_path}: no matches found')

print('\n'.join(report))
