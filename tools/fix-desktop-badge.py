with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the desktop Google stars badge with circular agent photo + text
old_badge = '''                    <!-- Google badge - slim trust bar (both mobile + desktop) -->
                    <div class="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 md:border-white/20 text-[10px] md:text-xs font-bold md:font-black uppercase tracking-widest mb-4 md:mb-6 shadow-lg md:transform md:hover:scale-105 transition-transform cursor-default">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full p-0.5" alt="Google reviews rating icon">
                        <span class="flex text-amber-400 gap-0.5 text-[9px] md:text-xs"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></span>
                        <span class="text-white/80 md:text-white md:opacity-90 ml-0.5 md:ml-1"><span class="md:hidden">4.9 &middot; Elkin, NC</span><span class="hidden md:inline">Verified Local Agency</span></span>
                    </div>'''

new_badge = '''                    <!-- Agent trust bar - circular photo + name (desktop hero) -->
                    <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6 shadow-lg cursor-default">
                        <img src="https://i.imgur.com/ayxaUyZ.jpeg" alt="Bill Layne - Your Local Insurance Agent" class="w-10 h-10 rounded-full object-cover object-top border-2 border-white/30" loading="eager">
                        <div>
                            <p class="text-sm font-black text-white leading-tight">Bill Layne</p>
                            <p class="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Independent Agent &middot; Since 2005</p>
                        </div>
                    </div>'''

if old_badge in html:
    html = html.replace(old_badge, new_badge)
    print("OK: Replaced Google stars badge with circular agent photo")
else:
    print("WARN: Exact badge not found, trying line-by-line match...")
    # Try finding just the key part
    key = 'Verified Local Agency'
    if key in html:
        print(f"  Found '{key}' in file - badge exists but whitespace may differ")
    else:
        print("  Badge text not found at all")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done!")
