import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find and replace the form card + success card with CTA card
# Use markers to find the section
start_marker = '<div class="bg-white rounded-2xl shadow-2xl p-6 mb-6 border border-slate-100">'
end_marker = 'Or call now: <a href="tel:3368351993" class="text-primary-600 font-bold">(336) 835-1993</a></p>\n                    </div>'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx == -1:
    print("WARN: Form card start not found")
elif end_idx == -1:
    print("WARN: Success card end not found")
else:
    end_idx += len(end_marker)
    old_section = html[start_idx:end_idx]
    print(f"Found form section: {len(old_section)} chars from pos {start_idx} to {end_idx}")

    new_cta = '''<div class="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                      <!-- Google social proof -->
                      <div class="flex items-center gap-2 mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="w-5 h-5" alt="Google">
                        <span class="text-yellow-400 text-sm">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                        <span class="text-sm font-bold text-slate-900">4.9 <span class="text-slate-400 font-normal">&middot; 127 reviews</span></span>
                      </div>

                      <h3 class="font-display font-black text-2xl text-slate-900 mb-2">Get Your Free Quote</h3>
                      <p class="text-sm text-slate-500 mb-5">Auto &amp; Home &mdash; compare 7 carriers in about 5 minutes.</p>

                      <!-- Benefits list -->
                      <ul class="space-y-3 mb-6">
                        <li class="flex items-center gap-3 text-sm text-slate-700">
                          <span class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-green-500 text-xs"></i></span>
                          <span><strong>7 carriers</strong> compete for your rate</span>
                        </li>
                        <li class="flex items-center gap-3 text-sm text-slate-700">
                          <span class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-green-500 text-xs"></i></span>
                          <span><strong>5 minutes</strong> &mdash; fast &amp; easy online form</span>
                        </li>
                        <li class="flex items-center gap-3 text-sm text-slate-700">
                          <span class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-green-500 text-xs"></i></span>
                          <span><strong>No obligation</strong> &mdash; no credit card needed</span>
                        </li>
                        <li class="flex items-center gap-3 text-sm text-slate-700">
                          <span class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-green-500 text-xs"></i></span>
                          <span><strong>Real local agent</strong> reviews your quote</span>
                        </li>
                      </ul>

                      <!-- Primary CTA -->
                      <a href="get-quote.html"
                        class="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white
                               font-display font-black text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center">
                        <i class="fas fa-search-dollar mr-2"></i> Compare My Rates &mdash; Free
                      </a>

                      <!-- Secondary CTA -->
                      <a href="tel:3368351993"
                        class="w-full mt-3 py-3 bg-slate-50 border border-slate-200 text-slate-700
                               font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center">
                        <i class="fas fa-phone-alt mr-2 text-primary-600"></i> Or Call (336) 835-1993
                      </a>
                    </div>'''

    html = html[:start_idx] + new_cta + html[end_idx:]
    print("OK: Replaced form card with CTA card")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Done!")
