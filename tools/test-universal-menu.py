"""Regressions for the shared drawer's generation and legacy-page boundaries."""
import importlib.util,json,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('build-universal-menu.py'))
menu=importlib.util.module_from_spec(spec);spec.loader.exec_module(menu)
cfg=json.loads((menu.ROOT/'tools/nav.json').read_text(encoding='utf-8'))

class UniversalMenuTests(unittest.TestCase):
 def test_homepage_has_inline_fallback_in_the_same_menu(self):
  self.assertIn('open data-inline-fallback',menu.render(cfg,'index.html'))
  self.assertNotIn('data-inline-fallback',menu.render(cfg,'auto-quote.html'))
 def test_trust_and_coverage_links_and_direct_blog(self):
  items=[item for group in cfg['universal']['groups'] for item in group['items']]
  hrefs={item['href'] for item in items}
  self.assertTrue({'/about/','/blog/','/renters-insurance/','/contact-us/?src=menu_business'} <= hrefs)
  self.assertNotIn('/blog/',{child['href'] for item in items for child in item.get('children',[])})
 def test_repeat_generation_preserves_existing_form_and_scripts(self):
  src='<html><head><title>Test</title></head><body><form><input name="email"></form><script>keepMe()</script></body></html>'
  generated=menu.transform(src,cfg,'auto-quote.html')
  self.assertEqual(generated,menu.transform(generated,cfg,'auto-quote.html'))
  self.assertIn('<form><input name="email"></form><script>keepMe()</script>',generated)
 def test_editorial_exclusions_remain_without_quote_or_phone_buttons(self):
  for rel in cfg['footer_cta_exclude']:
   drawer=menu.render(cfg,rel)
   self.assertNotIn('class="bli-um-quote"',drawer)
   self.assertNotIn('class="bli-um-call"',drawer)
 def test_spanish_labels_and_specialty_destinations(self):
  drawer=menu.render(cfg,'auto-center/pay-dmv-fine/es/index.html')
  self.assertIn('Seguro de Auto',drawer)
  self.assertIn('Botes y motos acuáticas',drawer)
  self.assertIn('href="/motorcycle-insurance/"',drawer)
  self.assertIn('href="/boat-insurance/"',drawer)
 def test_internal_tools_and_untracked_work_excluded(self):
  pages={rel for rel,src in menu.targets()}
  self.assertIn('index.html',pages)
  self.assertIn('auto-quote.html',pages)
  self.assertIn('boat-insurance/index.html',pages)
  self.assertNotIn('pdf-tools/index.html',pages)
  self.assertNotIn('claims-center/auto-report/index.html',pages)
 def test_legacy_double_head_not_rewritten(self):
  src='<head></head><body><head></head>article</body>'
  generated=menu.transform(src,cfg,'legacy.html')
  self.assertEqual(generated.count('</head>'),2)
  self.assertEqual(generated.count(menu.HEAD_START),1)

if __name__=='__main__':unittest.main()
