#!/usr/bin/env python3
"""Add missing meta description tags to all HTML files."""
import os, re, html as html_mod

ROOT = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE"
EXCLUDE_DIRS = {".git", "node_modules", ".claude"}
fixed_count = 0
skipped_has_desc = 0
skipped_redirect = 0
skipped_no_title = 0
errors = []

def clean_text(s):
    s = html_mod.unescape(s)
    return re.sub(r"\s+", " ", s).strip()

def extract_tag_content(content, tag):
    m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", content, re.DOTALL | re.IGNORECASE)
    if m:
        inner = re.sub(r"<[^>]+>", " ", m.group(1))
        return clean_text(inner)
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

def classify_page(filepath, title):
    rel = os.path.relpath(filepath, ROOT).replace("\\", "/").lower()
    if "/blog/blogs/" in rel or ("/blog/" in rel and "blog-template" not in rel):
        return "blog"
    if "/post/" in rel:
        return "post"
    if "carriers/" in rel:
        return "carrier"
    if "save-in-" in rel:
        return "save-in"
    if "community/" in rel:
        return "community"
    if any(x in rel for x in ["calculator", "evaluator", "analyzer", "checkup", "risk-assessment", "umbrella-policy"]):
        return "tool"
    if "/resources/" in rel or "guide" in rel:
        return "resource"
    if "contact" in rel:
        return "contact"
    if "auto-insurance" in rel or "auto-quote" in rel or "auto-center" in rel:
        return "auto"
    if "home-insurance" in rel:
        return "home"
    if "service" in rel:
        return "service"
    if "insurance-contact-information" in rel:
        return "contact-info"
    return "general"

def generate_description(filepath, title, og_desc, paragraphs, page_type):
    def strip_brand(t):
        return t.replace("| Bill Layne Insurance Agency", "").replace("| Bill Layne Insurance", "").replace("| Bill Layne", "").strip().rstrip("|").strip()

    def carrier_from_title(t):
        parts = t.split("|")[0].split("North Carolina")[0].replace("Insurance", "").strip()
        return parts if parts else t.split("|")[0].strip()

    def town_from_path(fp):
        m = re.search(r"save-in-([^/\\]+)-nc", os.path.relpath(fp, ROOT).replace("\\", "/"))
        return m.group(1).replace("-", " ").title() if m else ""

    topic = strip_brand(title)
    desc = ""

    if page_type == "blog":
        if og_desc and len(og_desc) > 40:
            base = og_desc.rstrip(".")
            if "Bill Layne" not in base:
                desc = truncate(f"{base}. Bill Layne Insurance, Elkin NC.", 160)
            else:
                desc = truncate(base, 160)
        else:
            desc = truncate(f"{topic} -- NC insurance tips from Bill Layne Insurance in Elkin. Learn more and compare rates today.", 160)

    elif page_type == "post":
        if og_desc and len(og_desc) > 40:
            base = og_desc.rstrip(".")
            if "Bill Layne" not in base:
                desc = truncate(f"{base}. Bill Layne Insurance, Elkin NC.", 160)
            else:
                desc = truncate(base, 160)
        else:
            desc = truncate(f"{topic} -- Expert insurance advice from Bill Layne Insurance, your NC independent agent. Get a free quote.", 160)

    elif page_type == "carrier":
        carrier = carrier_from_title(title)
        desc = truncate(f"Get {carrier} insurance quotes from Bill Layne, your North Carolina independent agent. Compare auto and home rates. Free quote today.", 160)

    elif page_type == "save-in":
        town = town_from_path(filepath)
        if town:
            desc = truncate(f"Save on auto and home insurance in {town}, NC. Bill Layne Insurance compares 7+ carriers to find your best rate. Free quote today.", 160)
        else:
            desc = truncate(f"Save on insurance in North Carolina. Bill Layne Insurance compares 7+ carriers to find your lowest rate. Free quote today.", 160)

    elif page_type == "community":
        desc = truncate(f"Discover {topic} in Surry County, NC. Brought to you by Bill Layne Insurance, proudly serving the community since 2005.", 160)

    elif page_type == "tool":
        desc = truncate(f"Free {topic} for NC residents. Analyze your coverage, find gaps, and discover savings. Bill Layne Insurance, Elkin NC.", 160)

    elif page_type == "resource":
        desc = truncate(f"{topic} -- Free insurance resource for North Carolina residents. Expert guidance from Bill Layne Insurance in Elkin, NC.", 160)

    elif page_type == "contact":
        desc = truncate("Contact Bill Layne Insurance Agency in Elkin, NC. Call (336) 835-1993 for free auto and home insurance quotes. Serving Surry County since 2005.", 160)

    elif page_type == "auto":
        desc = truncate(f"{topic}. Compare auto insurance rates from 7+ NC carriers with Bill Layne Insurance in Elkin. Get a free quote today.", 160)

    elif page_type == "home":
        desc = truncate(f"{topic}. Compare home insurance rates from top NC carriers. Bill Layne Insurance, Elkin NC. Get your free quote today.", 160)

    elif page_type == "contact-info":
        desc = truncate("Find insurance company contact info and claims phone numbers. A free resource from Bill Layne Insurance Agency, Elkin NC.", 160)

    elif page_type == "service":
        desc = truncate(f"{topic}. Bill Layne Insurance offers auto, home, and life insurance in Elkin, NC. Compare carriers and save today.", 160)

    else:
        if og_desc and len(og_desc) > 40:
            base = og_desc.rstrip(".")
            if "Bill Layne" not in base:
                desc = truncate(f"{base}. Bill Layne Insurance, Elkin NC.", 160)
            else:
                desc = truncate(base, 160)
        elif paragraphs and len(paragraphs) > 40:
            base = paragraphs[:120].rstrip(".")
            desc = truncate(f"{base}. Bill Layne Insurance, Elkin NC.", 160)
        else:
            desc = truncate(f"{topic}. Independent insurance agency in Elkin, NC serving Surry County. Compare rates from 7+ carriers. Call (336) 835-1993.", 160)

    desc = desc.replace('"', "'").replace("\n", " ").replace("\r", "")
    if len(desc) > 165:
        desc = truncate(desc, 160)
    return desc

def insert_meta_description(content, description):
    meta_tag = f'    <meta name="description" content="{description}">'
    title_end = re.search(r"</title>", content, re.IGNORECASE)
    if title_end:
        pos = title_end.end()
        if pos < len(content) and content[pos] == "\n":
            return content[:pos + 1] + meta_tag + "\n" + content[pos + 1:]
        else:
            return content[:pos] + "\n" + meta_tag + "\n" + content[pos:]
    return None

def process_file(filepath):
    global fixed_count, skipped_has_desc, skipped_redirect, skipped_no_title, errors
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        errors.append((filepath, str(e)))
        return

    if re.search(r'<meta\s+name=["\x27]description["\x27]', content, re.IGNORECASE):
        skipped_has_desc += 1
        return

    title = extract_tag_content(content, "title")
    if not title:
        skipped_no_title += 1
        return

    if title.strip().lower() in ("redirecting...", "redirecting"):
        skipped_redirect += 1
        return

    og_desc = extract_og_description(content)
    paragraphs = extract_first_paragraphs(content)
    page_type = classify_page(filepath, title)
    description = generate_description(filepath, title, og_desc, paragraphs, page_type)

    if not description:
        errors.append((filepath, "Could not generate description"))
        return

    new_content = insert_meta_description(content, description)
    if new_content is None:
        errors.append((filepath, "Could not find </title> to insert after"))
        return

    try:
        with open(filepath, "w", encoding="utf-8", newline="") as f:
            f.write(new_content)
        fixed_count += 1
        rel = os.path.relpath(filepath, ROOT)
        print(f"  FIXED [{page_type:12s}] {rel}")
    except Exception as e:
        errors.append((filepath, str(e)))

def main():
    print("=" * 70)
    print("Adding meta descriptions to HTML files")
    print("=" * 70)
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            if not fname.lower().endswith(".html"):
                continue
            filepath = os.path.join(dirpath, fname)
            file_count += 1
            process_file(filepath)

    print()
    print("=" * 70)
    print(f"RESULTS:")
    print(f"  Total HTML files scanned:   {file_count}")
    print(f"  Files FIXED (added desc):   {fixed_count}")
    print(f"  Skipped (already has desc): {skipped_has_desc}")
    print(f"  Skipped (redirect pages):   {skipped_redirect}")
    print(f"  Skipped (no title tag):     {skipped_no_title}")
    print(f"  Errors:                     {len(errors)}")
    if errors:
        print("\nERRORS:")
        for fp, msg in errors:
            print(f"  {fp}: {msg}")
    print("=" * 70)

if __name__ == "__main__":
    main()
