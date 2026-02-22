from PIL import Image
import os

LOGO_HEIGHT = 128
SRC_DIR = r'C:\Users\bill\AppData\Local\Temp\logo-optimize'

logos = {
    'nationwide.png': 'nationwide-opt.png',
    'progressive.png': 'progressive-opt.png',
    'travelers.webp': 'travelers-opt.png',
    'national-general.png': 'national-general-opt.png',
    'alamance.png': 'alamance-opt.png',
    'foremost.jpg': 'foremost-opt.png',
}

for src, dst in logos.items():
    src_path = os.path.join(SRC_DIR, src)
    dst_path = os.path.join(SRC_DIR, dst)
    img = Image.open(src_path)

    # Convert mode if needed
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')

    # Resize to 128px height, maintain aspect ratio
    ratio = LOGO_HEIGHT / img.height
    new_width = int(img.width * ratio)
    img = img.resize((new_width, LOGO_HEIGHT), Image.LANCZOS)

    # Save as PNG (keeps transparency for logos)
    img.save(dst_path, 'PNG', optimize=True)
    orig_size = os.path.getsize(src_path)
    new_size = os.path.getsize(dst_path)
    print(f'{src}: {img.width}x{img.height} | {orig_size//1024}KB -> {new_size//1024}KB')

# Rosa: 200x200 circle-ready crop
rosa_src = os.path.join(SRC_DIR, 'rosa.png')
rosa_dst = os.path.join(SRC_DIR, 'rosa-opt.jpg')
rosa = Image.open(rosa_src)
size = min(rosa.width, rosa.height)
left = (rosa.width - size) // 2
top = (rosa.height - size) // 2
rosa = rosa.crop((left, top, left + size, top + size))
rosa = rosa.resize((200, 200), Image.LANCZOS)
rosa = rosa.convert('RGB')
rosa.save(rosa_dst, 'JPEG', quality=85, optimize=True)
orig_size = os.path.getsize(rosa_src)
new_size = os.path.getsize(rosa_dst)
print(f'rosa.png: 200x200 | {orig_size//1024}KB -> {new_size//1024}KB')

print('Done!')
