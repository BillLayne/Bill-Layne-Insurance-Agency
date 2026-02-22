#!/usr/bin/env python3
"""Fix HTML files missing <title> and <meta name="description"> tags."""
import os, re, html as html_mod

ROOT = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE"
EXCLUDE_DIRS = {".git", "node_modules", ".claude"}
fixed = 0
skipped = 0

def clean_text(s):
    s = html_mod.unescape(s)
    return re.sub(r"\s+", " ", s).strip()

def extract_h1(content):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL | re.IGNORECASE)
    if m:
        inner = re.sub(r"<[^>]+>", " ", m.group(1))
        t = clean_text(inner)
        # Remove emoji
        t = re.sub(r'[\U0001f300-\U0001f9ff\U00002702-\U000027b0\U0000fe0f\u2600-\u26FF\u2700-\u27BF]+', '', t).strip()
        return t
    return ""

def extract_og_title(content):
    m = re.search(r'<meta\s+property=["\x27]og:title["\x27]\s+content=["\x27](.*?)["\x27]', content, re.IGNORECASE)
    if m:
        return clean_text(m.group(1))
    return ""

def extract_og_description(content):
    m = re.search(r'<meta\s+property=["\x27]og:description["\x27]\s+content=["\x27](.*?)["\x27]', content, re.IGNORECASE | re.DOTALL)
    if m:
        return clean_text(m.group(1))
    return ""

def extract_first_paragraphs(content, n=3):
    matches = re.findall(r"<p[^>]*>(.*?)</p>", content, re.DOTALL | re.IGNORECASE)
    texts = []
    for m in matches[:n]:
        t = re.sub(r"<[^>]+>", " ", m)
        t = clean_text(t)
        if len(t) > 20:
            texts.append(t)
    return " ".join(texts)

def truncate(s, maxlen=160):
    if len(s) <= maxlen:
        return s
    s = s[:maxlen - 1]
    i = s.rfind(" ")
    if i > 80:
        s = s[:i]
    s = s.rstrip(" ,;:-")
    if not s.endswith((".", "!", "?")):
        s += "."
    return s

def generate_desc_from_blog(h1, og_desc, paragraphs):
    topic = h1 if h1 else "NC Insurance Tips"
    if og_desc and len(og_desc) > 40:
        base = og_desc.rstrip(".")
        if "Bill Layne" not in base:
            return truncate(f"{base}. Bill Layne Insurance, Elkin NC.", 160)
        return truncate(base, 160)
    return truncate(f"{topic} -- NC insurance tips from Bill Layne Insurance in Elkin. Learn more and compare rates today.", 160)

def process_file(filepath):
    global fixed, skipped
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except:
        return

    # Skip if already has title
    if re.search(r"<title>", content, re.IGNORECASE):
        skipped += 1
        return

    # Skip if already has meta description
    if re.search(r'<meta\s+name=["\x27]description["\x27]', content, re.IGNORECASE):
        skipped += 1
        return

    # Skip redirect pages
    if "http-equiv" in content.lower() and "refresh" in content.lower():
        skipped += 1
        return

    h1 = extract_h1(content)
    og_title = extract_og_title(content)
    og_desc = extract_og_description(content)
    paragraphs = extract_first_paragraphs(content)

    # Build title from h1 or og:title
    page_title = h1 if h1 else og_title
    if not page_title:
        page_title = os.path.basename(filepath).replace(".html", "").replace("-", " ").title()

    title_tag = f"{page_title} | Bill Layne Insurance"
    description = generate_desc_from_blog(h1, og_desc, paragraphs)
    description = description.replace('"', "'").replace("\n", " ").replace("\r", "")

    # Find insertion point: after <meta charset="UTF-8"> or after <head>
    # Best: insert right after <meta charset line
    insert_tags = f'    <title>{title_tag}</title>\n    <meta name="description" content="{description}">'

    # Try to insert after the last meta tag in the head before <style> or <link>
    # Strategy: insert right before the first <style> or <link> or </head>
    patterns = [
        (r'(<meta\s+name="twitter:image"[^>]*>)', r'\1\n' + insert_tags.replace('\\', '\\\\')),
    ]

    inserted = False
    for pat, repl in patterns:
        m = re.search(pat, content, re.IGNORECASE)
        if m:
            pos = m.end()
            content = content[:pos] + "\n" + insert_tags + "\n" + content[pos:]
            inserted = True
            break

    if not inserted:
        # Fallback: insert right after <head> or after first <meta charset>
        m = re.search(r'(<meta\s+charset=["\x27]UTF-8["\x27]\s*/?>)', content, re.IGNORECASE)
        if m:
            pos = m.end()
            content = content[:pos] + "\n" + insert_tags + "\n" + content[pos:]
            inserted = True

    if not inserted:
        m = re.search(r'(<head[^>]*>)', content, re.IGNORECASE)
        if m:
            pos = m.end()
            content = content[:pos] + "\n" + insert_tags + "\n" + content[pos:]
            inserted = True

    if inserted:
        with open(filepath, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        fixed += 1
        rel = os.path.relpath(filepath, ROOT)
        print(f"  FIXED: {rel}")
        print(f"    title: {title_tag[:70]}...")
        print(f"    desc:  {description[:70]}...")
    else:
        print(f"  SKIP (no insertion point): {os.path.relpath(filepath, ROOT)}")

def main():
    print("=" * 70)
    print("Pass 2: Fix files missing <title> tags")
    print("=" * 70)
    count = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            if not fname.lower().endswith(".html"):
                continue
            filepath = os.path.join(dirpath, fname)
            count += 1
            process_file(filepath)
    print()
    print(f"Total scanned: {count}")
    print(f"Fixed: {fixed}")
    print(f"Skipped: {skipped}")
    print("=" * 70)

if __name__ == "__main__":
    main()
