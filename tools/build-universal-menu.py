#!/usr/bin/env python3
"""Generate the shared drawer from tools/nav.json without changing page content.

Run after build-nav.py: python tools/build-universal-menu.py --apply (or --check).
Existing menus remain as a fallback if the shared script cannot load. Only tracked
site pages with existing navigation are included; internal tools are not added.
"""
from pathlib import Path
import argparse, html, json, re, subprocess

ROOT = Path(__file__).resolve().parent.parent
HEAD_START = '<!-- BLI-UNIVERSAL-HEAD:START -->'
HEAD_END = '<!-- BLI-UNIVERSAL-HEAD:END -->'
START = '<!-- BLI-UNIVERSAL-MENU:START - generated from tools/nav.json; do not edit by hand. -->'
END = '<!-- BLI-UNIVERSAL-MENU:END -->'
ICONS = {
 'home': '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
 'car': '<path d="m5 7 2-4h10l2 4 2 3v8H3v-8zM3 10h18M6 18v3m12-3v3"/><path d="M6 14h2m8 0h2"/>',
 'ride': '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-8 5 8H5m10-8h3l1 8M8 6h4m3-3 3 1v5"/>',
 'boat': '<path d="m3 12 9-3 9 3-3 7H6zM7 10V5h9v6M12 5V2M2 22q3-4 6 0 4-4 8 0 3-4 6 0"/>',
 'claims': '<path d="M8 4H5v18h14V4h-3M8 2h8v5H8zM8 12h8m-8 5h6"/>',
 'service': '<path d="M14 3a6 6 0 0 0-7 8l-5 5a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-4 4-4-4z"/>',
 'user': '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3z"/>',
 'pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
 'book': '<path d="M12 5v17M2 3c4-1 7 0 10 2 3-2 6-3 10-2v16c-4-1-7 0-10 2-3-2-6-3-10-2z"/>',
 'article': '<path d="M5 2h10l4 4v16H5zM15 2v5h4M8 11h8m-8 4h8m-8 4h5"/>',
 'video': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m10 8 6 4-6 4z"/>',
 'people': '<circle cx="12" cy="6" r="3"/><path d="M6 20v-3a6 6 0 0 1 12 0v3M3 8a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6M1 21v-3m22 3v-3"/>',
 'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
 'globe': '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
 'phone': '<path d="m6 3 3 5-3 3a15 15 0 0 0 7 7l3-3 5 3c0 3-2 4-4 4C9 22 2 15 2 7c0-2 1-4 4-4z"/>',
 'arrow': '<path d="m9 5 7 7-7 7"/>',
 'close': '<path d="m5 5 14 14M19 5 5 19"/>',
}

def svg(name):
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[name]+'</svg>'

def esc(value):
 return html.escape(html.unescape(value), quote=True)

def render(cfg, rel):
 u=cfg['universal']; spanish=rel in cfg.get('lang',{}) and cfg['lang'][rel]=='es' or rel.startswith('espanol/')
 labels=cfg.get('labels_es',{}) if spanish else {}
 words=u['es'] if spanish else u['en']
 def row(item):
  label=labels.get(item['href'],item.get('label_es') if spanish else None) or item['label']
  return '<a class="bli-um-link" href="%s"><span class="bli-um-icon">%s</span><span>%s</span><span class="bli-um-chevron">%s</span></a>'%(esc(item['href']),svg(item['icon']),esc(label),svg('arrow'))
 sections=[]
 for group in u['groups']:
  rows=[]
  for item in group['items']:
   link=row(item)
   if item.get('children'):
    link='<div class="bli-um-resource-row">'+link+'<button class="bli-um-expand" type="button" aria-label="%s" aria-expanded="false" aria-controls="bli-um-resources">%s</button></div><div class="bli-um-children" id="bli-um-resources" hidden>%s</div>'%(esc(words['expand']),svg('arrow'),''.join(row(child) for child in item['children']))
   rows.append(link)
  heading='<h3 class="bli-um-label">%s</h3>'%esc(words[group['key']]) if group['key'] else ''
  sections.append('<section class="bli-um-group">'+heading+''.join(rows)+'</section>')
 actions='' if rel in cfg.get('footer_cta_exclude',[]) else '<div class="bli-um-actions"><a class="bli-um-quote" data-source="universal_menu" href="%s?src=universal_menu">%s <span aria-hidden="true">&rarr;</span></a><a class="bli-um-call" data-source="universal_menu" href="%s">%s %s</a></div><p class="bli-um-hours">%s</p>'%(esc(cfg['quote_href']),esc(words['quote']),esc(cfg['phone_href']),svg('phone'),esc(cfg['phone_display']),esc(words['hours']))
 return '\n'.join([START,
  '<div class="bli-um-entry"><button type="button" data-bli-menu-open>%s <span aria-hidden="true">&rarr;</span></button></div>'%esc(words['open']),
  '<dialog id="bli-site-menu" class="bli-um-dialog" aria-labelledby="bli-um-title" lang="%s"%s>'%(('es' if spanish else 'en'), ' open data-inline-fallback' if rel=='index.html' else ''),
  '<header class="bli-um-header"><a href="/" aria-label="Bill Layne Insurance"><img src="%s" alt="Bill Layne Insurance" width="240" height="64" decoding="async" loading="lazy"></a><button type="button" class="bli-um-close" aria-label="%s">%s</button></header>'%(esc(u['logo']),esc(words['close']),svg('close')),
  '<h2 id="bli-um-title">%s</h2>'%esc(words['menu']),
  '<nav class="bli-um-scroll" aria-label="%s">%s</nav>'%(esc(words['menu']),''.join(sections)),
  '<footer class="bli-um-footer"><p class="bli-um-personal">%s</p>%s</footer>'%(esc(words['personal']),actions),
  '</dialog>',END])

def transform(src,cfg,rel):
 version=cfg['universal']['version']
 assets=HEAD_START+'\n<link rel="stylesheet" href="/css/universal-menu.css?v='+version+'">\n<script src="/js/universal-menu.js?v='+version+'" defer></script>\n'+HEAD_END
 for start,end,block,closing in [(HEAD_START,HEAD_END,assets,'head'),(START,END,render(cfg,rel),'body')]:
  pattern=re.compile(re.escape(start)+'.*?'+re.escape(end),re.S)
  if pattern.search(src):
   src,n=pattern.subn(lambda _:block,src); assert n==1,(rel,'duplicate marker')
  else:
   pattern=re.compile(r'</'+closing+r'\s*>',re.I)
   matches=list(pattern.finditer(src)); assert matches,(rel,'missing closing tag')
   # A few legacy articles contain a second head/body. Preserve that existing
   # markup; assets belong in the first head, the drawer after the last body.
   match=matches[0] if closing=='head' else matches[-1]
   src=src[:match.start()]+block+'\n'+src[match.start():]
 return src

def targets():
 files=subprocess.check_output(['git','ls-files','*.html'],cwd=ROOT,text=True).splitlines()
 markers=re.compile(r'BLI-NAV:START|id=["\'](?:mobileDockPanel|menuPanel|menu-drawer|navigation-menu|mobile-menu|navDrawer)["\']|class=["\']menu-drawer')
 for rel in files:
  if rel.startswith(('templates/','mail-gateway/','pdf-tools/','shared/','social-media/')): continue
  src=(ROOT/rel).read_text(encoding='utf-8')
  if rel=='index.html' or markers.search(src): yield rel,src

def main():
 parser=argparse.ArgumentParser(description=__doc__); parser.add_argument('--apply',action='store_true');parser.add_argument('--check',action='store_true');args=parser.parse_args()
 cfg=json.loads((ROOT/'tools/nav.json').read_text(encoding='utf-8'))
 changed=[]; count=0; pages=[]
 for rel,src in targets():
  count+=1; pages.append(rel); out=transform(src,cfg,rel)
  if src!=out:
   changed.append(rel)
   if args.apply:(ROOT/rel).write_text(out,encoding='utf-8')
 print('%d menu pages; %d %s'%(count,len(changed),'updated' if args.apply else 'need updating'))
 if args.apply:
  (ROOT/'output/universal-menu').mkdir(parents=True,exist_ok=True)
  (ROOT/'output/universal-menu/scope.json').write_text(json.dumps(pages,indent=2),encoding='utf-8')
 if args.check and changed: raise SystemExit(1)

if __name__=='__main__':main()
