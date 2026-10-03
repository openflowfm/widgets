// Runtime consumer check against the built package (`npm run build` first), run
// by `npm run test:package`. Node resolves the package through its own exports
// map (self-reference), so these are the paths a bundler would get.

import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

// One of each style the suite apps import today.
const specifiers = [
  '@openflow/widgets',
  '@openflow/widgets/palette.css',
  '@openflow/widgets/tokens.css',
  '@openflow/widgets/type.css',
  '@openflow/widgets/controls/Button.tsx',
  '@openflow/widgets/controls/fill.ts',
  '@openflow/widgets/controls/controls.css',
  '@openflow/widgets/controls/Pointing.tsx',
  '@openflow/widgets/controls/pointing.ts',
  '@openflow/widgets/chrome/Modal.tsx',
  '@openflow/widgets/chrome/graphContext.ts',
  '@openflow/widgets/chrome/chrome.css',
  '@openflow/widgets/debug',
  '@openflow/widgets/debug/index.ts',
  '@openflow/widgets/debug/Harness.tsx',
  '@openflow/widgets/debug/axis.ts',
  '@openflow/widgets/gesture/usePendingValue.ts',
  '@openflow/widgets/mixer/MixerView.tsx',
  '@openflow/widgets/mixer/model.ts',
  '@openflow/widgets/music/Waveform.tsx',
  '@openflow/widgets/music/outline.ts',
  '@openflow/widgets/notation/PianoRoll.tsx',
  '@openflow/widgets/notation/notation.css',
  '@openflow/widgets/param/param.ts',
  '@openflow/widgets/theme/ThemeRoot.tsx',
  '@openflow/widgets/theme/theme.css',
];

test('every import style the apps use resolves to a file in dist/', () => {
  for (const specifier of specifiers) {
    const file = fileURLToPath(import.meta.resolve(specifier));
    assert.ok(file.startsWith(dist), `${specifier} -> ${file} is outside dist/`);
    assert.ok(existsSync(file), `${specifier} -> ${file} does not exist`);
    assert.match(file, /\.(js|css)$/, `${specifier} -> ${file}`);
  }
});

// `Pointing.tsx` and `pointing.ts` were distinct sources, but compiled they would
// both be `pointing.js` on a case-insensitive disk (macOS, Windows), and one
// would silently replace the other.
test('no two shipped files differ only by case', () => {
  const seen = new Map<string, string>();
  for (const file of globSync('**/*', { cwd: dist })) {
    const key = file.toLowerCase();
    assert.equal(seen.get(key), undefined, `${file} collides with ${seen.get(key)}`);
    seen.set(key, file);
  }
});

test('Pointing.tsx and the old pointing.ts resolve to different modules', () => {
  const component = fileURLToPath(import.meta.resolve('@openflow/widgets/controls/Pointing.tsx'));
  const engine = fileURLToPath(import.meta.resolve('@openflow/widgets/controls/pointing.ts'));
  assert.match(readFileSync(component, 'utf8'), /export function Pointing\b/);
  assert.match(readFileSync(engine, 'utf8'), /export function installPointing\b/);
});

test('the compiled modules import only .js and .css siblings, and they exist', () => {
  const relative = /(?:from|import)\s*['"](\.{1,2}\/[^'"]+)['"]/g;
  const files = globSync('**/*.js', { cwd: dist });
  assert.ok(files.length > 50, `only ${files.length} modules in dist/`);
  for (const file of files) {
    const text = readFileSync(join(dist, file), 'utf8');
    for (const [, target] of text.matchAll(relative)) {
      assert.match(target, /\.(js|css)$/, `${file} imports ${target}`);
      assert.ok(existsSync(join(dist, dirname(file), target)), `${file} imports missing ${target}`);
    }
  }
});

test('stylesheet @imports point at shipped files', () => {
  for (const file of globSync('**/*.css', { cwd: dist })) {
    const text = readFileSync(join(dist, file), 'utf8');
    for (const [, target] of text.matchAll(/@import\s+'([^']+)'/g)) {
      assert.ok(existsSync(join(dist, dirname(file), target)), `${file} imports missing ${target}`);
    }
  }
});

test('no declaration carries a stylesheet import', () => {
  for (const file of globSync('**/*.d.ts', { cwd: dist })) {
    assert.doesNotMatch(readFileSync(join(dist, file), 'utf8'), /^import '[^']+\.css';/m, file);
  }
});

test('the model modules run without a bundler', async () => {
  const param = await import('@openflow/widgets/param/param.ts');
  const gain = { name: 'Gain', kind: 'float', min: 0, max: 10, defaultValue: 0 } as const;
  assert.equal(param.span(gain), 10);
  assert.equal(param.clamp(gain, 12), 10);
});
