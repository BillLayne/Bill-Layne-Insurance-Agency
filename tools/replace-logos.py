import os
import re

BASE = r'C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE'

# Old URL -> New optimized URL mapping
replacements = {
    'https://i.imgur.com/Mv5V7tV.png': 'https://i.imgur.com/MjJTKti.png',
    'https://i.imgur.com/K6kTnTa.png': 'https://i.imgur.com/SJQzwRU.png',
    'https://github.com/BillLayne/bill-layne-images/blob/main/logos/Travelers%20Logo.webp?raw=true': 'https://i.imgur.com/JNB2wDG.png',
    'https://i.imgur.com/HF8oPAF.png': 'https://i.imgur.com/9ZWQsAS.png',
    'https://imgur.com/CNFRCZc.png': 'https://i.imgur.com/RexcFEo.png',
    # Keep foremost as-is (already small at 10KB)
    # Rosa photo
    'https://i.imgur.com/iKER80U.png': 'https://i.imgur.com/W2t2vHm.jpeg',
}

files_to_check = []
for root, dirs, files in os.walk(BASE):
    # Skip .git and node_modules
    dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.claude')]
    for f in files:
        if f.endswith('.html'):
            files_to_check.append(os.path.join(root, f))

changed_files = []
for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        content = fh.read()

    original = content
    for old_url, new_url in replacements.items():
        content = content.replace(old_url, new_url)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as fh:
            fh.write(content)
        rel = os.path.relpath(filepath, BASE)
        count = sum(1 for old in replacements if old in original)
        print(f'Updated: {rel} ({count} replacements)')
        changed_files.append(rel)

print(f'\nTotal: {len(changed_files)} files updated')
