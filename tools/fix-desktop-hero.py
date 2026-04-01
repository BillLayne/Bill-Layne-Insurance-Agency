import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix desktop headline size: text-5xl lg:text-6xl → text-4xl lg:text-5xl
#    This prevents the 4-line wrapping at typical desktop widths
old_desktop_h2 = '<span class="hidden md:block text-5xl lg:text-6xl leading-[1.05]">Stop Overpaying<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-yellow-200">for NC Insurance.</span></span>'
new_desktop_h2 = '<span class="hidden md:block leading-[1.05]" style="font-size: clamp(2.25rem, 4vw, 3.75rem);">Stop Overpaying<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-yellow-200">for NC Insurance.</span></span>'

if old_desktop_h2 in html:
    html = html.replace(old_desktop_h2, new_desktop_h2)
    print("OK: Fixed desktop headline sizing with clamp()")
else:
    print("WARN: Desktop headline not found - checking...")
    # Try to find it with a regex
    pattern = r'<span class="hidden md:block[^"]*">Stop Overpaying'
    match = re.search(pattern, html)
    if match:
        print(f"  Found at position {match.start()}: {html[match.start():match.start()+120]}")
    else:
        print("  Not found at all")

# 2. Hide the Bill Layne photo on desktop - it makes the hero too tall
#    The form alone should be the right column content
old_photo_block = '                    <div class="relative w-full aspect-[4/5] max-w-lg mx-auto">'
new_photo_block = '                    <div class="relative w-full aspect-[4/5] max-w-lg mx-auto hidden">'
if old_photo_block in html:
    html = html.replace(old_photo_block, new_photo_block)
    print("OK: Hidden Bill Layne photo below form (was making hero too tall)")
else:
    print("WARN: Photo block not found")

# 3. Reduce hero min-height so it doesn't force excess vertical space
old_header = 'class="-mt-20 relative pt-24 pb-8 md:pt-40 md:pb-24 bg-vivid-hero text-white overflow-hidden hidden md:min-h-[60vh] lg:min-h-[80vh] md:flex items-center"'
new_header = 'class="-mt-20 relative pt-24 pb-8 md:pt-32 md:pb-16 bg-vivid-hero text-white overflow-hidden hidden md:min-h-[50vh] lg:min-h-[65vh] md:flex items-center"'
if old_header in html:
    html = html.replace(old_header, new_header)
    print("OK: Reduced hero padding and min-height for compact above-fold view")
else:
    print("WARN: Header class not found")

# 4. Tighten the mb on the h2 heading for desktop
old_h2_wrapper = 'class="font-display font-black tracking-tight mb-3 md:mb-6"'
new_h2_wrapper = 'class="font-display font-black tracking-tight mb-3 md:mb-4"'
if old_h2_wrapper in html:
    html = html.replace(old_h2_wrapper, new_h2_wrapper)
    print("OK: Tightened heading bottom margin")
else:
    print("WARN: h2 wrapper class not found")

# 5. Reduce the desktop CTA spacing: mb-8 on the "Compare 7 / See Your Savings" pill
old_pill = 'rounded-2xl px-4 py-2.5 mb-8'
new_pill = 'rounded-2xl px-4 py-2 mb-4'
if old_pill in html:
    html = html.replace(old_pill, new_pill)
    print("OK: Tightened CTA pill spacing")
else:
    print("WARN: CTA pill not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\nDone! Desktop hero should now be compact with CTAs above the fold.")
