"""
Analyze a blog HTML file for base64 images, extract them, and report metadata.
"""

import re
import os
import base64
import io
from html.parser import HTMLParser
from PIL import Image

# === Configuration ===
INPUT_FILE = r"C:\Users\bill\OneDrive\Documents\Blog Folders stored\additional living expenses update.html"
TEMP_DIR = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE\blog\temp"

# === Create temp directory ===
os.makedirs(TEMP_DIR, exist_ok=True)
print(f"Temp directory: {TEMP_DIR}")
print("=" * 80)

# === Read the HTML file ===
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    html_content = f.read()

file_size_kb = len(html_content.encode("utf-8")) / 1024
print(f"File: {os.path.basename(INPUT_FILE)}")
print(f"File size: {file_size_kb:.1f} KB")
print("=" * 80)

# === Split into lines for line-number reporting ===
lines = html_content.split("\n")

# === Find all base64 image data URIs ===
pattern = r'data:image/(png|jpeg|jpg|gif|webp);base64,([A-Za-z0-9+/=]+)'

print("\n### BASE64 IMAGES FOUND ###\n")

image_count = 0
matches_with_lines = []

for line_num, line in enumerate(lines, start=1):
    for match in re.finditer(pattern, line):
        image_count += 1
        img_format = match.group(1)
        b64_data = match.group(2)

        # Decode base64
        try:
            img_bytes = base64.b64decode(b64_data)
        except Exception as e:
            print(f"  [ERROR] Could not decode base64 for image {image_count}: {e}")
            continue

        raw_size_kb = len(img_bytes) / 1024

        # Open with Pillow
        img = Image.open(io.BytesIO(img_bytes))
        width, height = img.size
        mode = img.mode

        # Convert to JPEG for output
        output_name = f"img-{image_count}.jpg"
        output_path = os.path.join(TEMP_DIR, output_name)

        # Convert RGBA/P to RGB for JPEG compatibility
        if img.mode in ("RGBA", "P", "LA"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                bg.paste(img, mask=img.split()[-1])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Save as JPEG with good quality
        img.save(output_path, "JPEG", quality=85, optimize=True)
        saved_size_kb = os.path.getsize(output_path) / 1024

        conversion_note = ""
        if img_format.lower() == "png":
            savings = raw_size_kb - saved_size_kb
            conversion_note = f" (converted from PNG, saved {savings:.1f} KB)"

        print(f"Image #{image_count}:")
        print(f"  Line number:    {line_num}")
        print(f"  Source format:  {img_format.upper()}")
        print(f"  Dimensions:     {width} x {height} px")
        print(f"  Color mode:     {mode}")
        print(f"  Raw size:       {raw_size_kb:.1f} KB")
        print(f"  Saved as:       {output_name} -> {saved_size_kb:.1f} KB{conversion_note}")
        print(f"  Full path:      {output_path}")
        print()

        matches_with_lines.append({
            "num": image_count,
            "line": line_num,
            "format": img_format,
            "width": width,
            "height": height,
            "raw_kb": raw_size_kb,
            "saved_kb": saved_size_kb,
            "path": output_path,
        })

if image_count == 0:
    print("  No base64 images found in file.")

print(f"Total base64 images found: {image_count}")
print("=" * 80)

# === Identify img tags and their attributes ===
print("\n### IMG TAG CONTEXT (class, alt, style) ###\n")

img_tag_pattern = r'<img\s[^>]*>'
img_index = 0
for line_num, line in enumerate(lines, start=1):
    for match in re.finditer(img_tag_pattern, line, re.IGNORECASE):
        img_tag = match.group(0)

        has_base64 = "base64," in img_tag

        alt_match = re.search(r'alt\s*=\s*["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
        class_match = re.search(r'class\s*=\s*["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
        style_match = re.search(r'style\s*=\s*["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
        id_match = re.search(r'\bid\s*=\s*["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
        width_match = re.search(r'width\s*=\s*["\']?(\d+)', img_tag, re.IGNORECASE)
        height_match = re.search(r'height\s*=\s*["\']?(\d+)', img_tag, re.IGNORECASE)

        src_match = re.search(r'src\s*=\s*["\']([^"\']{0,100})', img_tag, re.IGNORECASE)
        src_preview = src_match.group(1)[:80] + "..." if src_match and len(src_match.group(1)) > 80 else (src_match.group(1) if src_match else "N/A")

        alt_text = alt_match.group(1) if alt_match else "(no alt)"
        css_class = class_match.group(1) if class_match else "(no class)"
        style = style_match.group(1) if style_match else "(no style)"
        elem_id = id_match.group(1) if id_match else "(no id)"
        w = width_match.group(1) if width_match else "?"
        h = height_match.group(1) if height_match else "?"

        img_index += 1
        is_hero = ""
        if img_index == 1:
            is_hero = " <<< LIKELY HERO IMAGE (first img tag)"
        if class_match and "hero" in class_match.group(1).lower():
            is_hero = " <<< HERO IMAGE (class contains 'hero')"

        base64_label = "[BASE64]" if has_base64 else "[EXTERNAL]"

        print(f"  img #{img_index} (line {line_num}) {base64_label}{is_hero}")
        print(f"    alt:    \"{alt_text}\"")
        print(f"    class:  \"{css_class}\"")
        print(f"    id:     \"{elem_id}\"")
        print(f"    style:  \"{style[:120]}\"")
        print(f"    size:   {w} x {h}")
        print(f"    src:    {src_preview}")
        print()

print("=" * 80)

# === Extract visible text content ===
print("\n### TEXT CONTENT ANALYSIS ###\n")

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.skip_tags = {"script", "style", "noscript", "head"}
        self.current_skip = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.skip_tags:
            self.current_skip += 1

    def handle_endtag(self, tag):
        if tag.lower() in self.skip_tags:
            self.current_skip = max(0, self.current_skip - 1)

    def handle_data(self, data):
        if self.current_skip == 0:
            text = data.strip()
            if text:
                self.text_parts.append(text)

extractor = TextExtractor()
extractor.feed(html_content)
all_text = " ".join(extractor.text_parts)

# Clean up whitespace
all_text = re.sub(r'\s+', ' ', all_text).strip()

words = all_text.split()
total_words = len(words)

# Read time estimation (average 238 words per minute)
read_time_min = total_words / 238
read_time_display = max(1, round(read_time_min))

print(f"Total word count:     {total_words}")
print(f"Estimated read time:  {read_time_display} min ({read_time_min:.1f} min exact)")
print()

# First 500 words
first_500 = " ".join(words[:500])
print(f"--- First 500 words ({min(500, total_words)} shown) ---")
print(first_500)
print()
print("=" * 80)

# === Summary ===
print("\n### SUMMARY ###\n")
print(f"File:              {os.path.basename(INPUT_FILE)}")
print(f"File size:         {file_size_kb:.1f} KB")
print(f"Base64 images:     {image_count}")
print(f"Total img tags:    {img_index}")
print(f"Word count:        {total_words}")
print(f"Read time:         ~{read_time_display} min")
print(f"Images saved to:   {TEMP_DIR}")
total_saved_kb = sum(m["saved_kb"] for m in matches_with_lines)
print(f"Total image data:  {total_saved_kb:.1f} KB (as JPEG)")
print()
print("Ready for Imgur upload from temp directory.")
