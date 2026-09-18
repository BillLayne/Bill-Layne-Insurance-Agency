"""Regression checks for generated blog menu ownership and CTA exceptions."""
import importlib.util
import contextlib
import io
import pathlib
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('build_nav', pathlib.Path(__file__).with_name('build-nav.py'))
nav = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nav)


class BlogNavigationTests(unittest.TestCase):
    def test_existing_and_new_blogs_remain_owned_by_wave_seven(self):
        cfg = nav.load_cfg()
        with tempfile.TemporaryDirectory() as root:
            folder = pathlib.Path(root, 'blog', 'blogs')
            folder.mkdir(parents=True)
            existing = nav.render_block(cfg, dock=False)
            (folder / 'existing.html').write_text(existing, encoding='utf-8')
            (folder / 'new.html').write_text('<body>New article</body>', encoding='utf-8')
            (folder / 'hybrid.html').write_text(existing + '<div id="mobileDockPanel"></div>', encoding='utf-8')
            (folder / 'legacy.html').write_text('<div id="mobileDockPanel"></div>', encoding='utf-8')
            assigned = 'blog/blogs/assigned.html'
            cfg['waves']['2b']['pages'].append(assigned)
            (folder / 'assigned.html').write_text(nav.render_block(cfg), encoding='utf-8')
            with patch.object(nav, 'ROOT', root):
                self.assertEqual(nav.discover_menuless_blog(cfg), [
                    'blog/blogs/existing.html', 'blog/blogs/hybrid.html', 'blog/blogs/new.html'])

    def test_changed_canonical_link_updates_existing_footer(self):
        cfg = nav.load_cfg()
        src = '<head></head><body></body>'
        current, _ = nav.transform_standalone(src, cfg, 'blog/blogs/example.html', dock=False)
        cfg['links'][0]['label'] = 'Updated Home'
        updated, _ = nav.transform_standalone(current, cfg, 'blog/blogs/example.html', dock=False)
        self.assertNotEqual(current, updated)
        self.assertIn('Updated Home</a>', updated)
        self.assertEqual(updated.count(nav.START), 1)
        self.assertEqual(nav.transform_standalone(updated, cfg, 'blog/blogs/example.html', dock=False)[0], updated)

    def test_non_owner_articles_keep_links_without_sales_buttons(self):
        cfg = nav.load_cfg()
        for rel in cfg['footer_cta_exclude']:
            result, _ = nav.transform_standalone('<head></head><body></body>', cfg, rel, dock=False)
            self.assertNotIn('href="tel:', result)
            self.assertNotIn('href="/get-quote"', result)
            for link in cfg['links']:
                self.assertIn('href="%s"' % link['href'], result)

    def test_check_command_fails_on_drift_in_existing_footer(self):
        cfg = nav.load_cfg()
        with tempfile.TemporaryDirectory() as root:
            folder = pathlib.Path(root, 'blog', 'blogs')
            folder.mkdir(parents=True)
            current, _ = nav.transform_standalone('<head></head><body></body>', cfg,
                                                  'blog/blogs/example.html', dock=False)
            (folder / 'example.html').write_text(current.replace('>Client Hub</a>', '>Old Portal</a>'), encoding='utf-8')
            with patch.object(nav, 'ROOT', root), patch.object(nav, 'load_cfg', return_value=cfg), \
                    patch('sys.argv', ['build-nav.py', '--wave', '7', '--check']), \
                    contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as failure:
                nav.main()
            self.assertEqual(failure.exception.code, 1)


if __name__ == '__main__':
    unittest.main()
