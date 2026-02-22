"""Optimize community page images: convert PNG to JPEG for smaller file sizes."""
from PIL import Image
import os

SRC = r'C:\Users\bill\Downloads\community page\surry-county\assets'
DST = r'C:\Users\bill\AppData\Local\Temp\community-optimize'
os.makedirs(DST, exist_ok=True)

for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'):
        continue
    src_path = os.path.join(SRC, f)
    name = os.path.splitext(f)[0]
    dst_path = os.path.join(DST, f'{name}.jpg')

    img = Image.open(src_path)
    if img.mode in ('RGBA', 'P'):
        # White background for transparency
        bg = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    img.save(dst_path, 'JPEG', quality=85, optimize=True)
    orig = os.path.getsize(src_path)
    new = os.path.getsize(dst_path)
    print(f'{f}: {orig//1024}KB -> {new//1024}KB ({name}.jpg)')

print('\nDone! Files in:', DST)
