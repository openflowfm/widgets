// Runs after `tsc -p tsconfig.build.json` (see `npm run build`).
//
// 1. The stylesheets ship beside the compiled modules that import them: `tsc`
//    emits `dist/controls/Knob.js` with its `import './controls.css'` intact, so
//    `dist/controls/controls.css` has to exist. Copied as-is; consumers' bundlers
//    resolve the `@import`s and the font `url()`s the same way they did from `src/`.
// 2. `tsc` also keeps those side-effect imports in the `.d.ts` files, where they
//    mean nothing and make a consumer without a `*.css` module declaration fail
//    with TS2882 (TypeScript 7). They are blanked in the declarations only; the
//    line stays so the declaration maps still line up.
import { copyFileSync, globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

for (const file of globSync('**/*.css', { cwd: 'src' })) {
  const to = join('dist', file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join('src', file), to);
}

const cssImport = /^import '[^']+\.css';\n/gm;
for (const file of globSync('dist/**/*.d.ts')) {
  const text = readFileSync(file, 'utf8');
  const stripped = text.replace(cssImport, '\n');
  if (stripped !== text) writeFileSync(file, stripped);
}
