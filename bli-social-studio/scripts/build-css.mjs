// Concatenate the source stylesheets into the shipped stylesheet.
// tokens.css must come first — components.css consumes its custom properties.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const parts = ['src/styles/tokens.css', 'src/styles/components.css'];
const css = parts.map((f) => readFileSync(join(pkgRoot, f), 'utf8')).join('\n');
mkdirSync(join(pkgRoot, 'dist'), { recursive: true });
writeFileSync(join(pkgRoot, 'dist', 'bli-social-studio.css'), css);
console.log(`dist/bli-social-studio.css (${Math.round(css.length / 1024)} KB)`);
