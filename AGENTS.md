# Widgets

Read README.md as the topic index, then only docs matching the change.
Widgets takes props and numbers: no Live, protocol, bridge, core or application imports. Use real TypeScript extensions for imports. Nothing loads from a CDN. Update the governing topic doc whenever functionality changes.

Use Storybook (`npm run dev`) for gesture and visual changes; say which story was actually checked. A new widget gets a stories file beside it, with at least a default and a disabled story.

## Checks

Run `npm ci` once per worktree. Run each check once, in this order, after your last edit. CI (`.github/workflows/ci.yml`) runs the same list on every push and PR, and the release workflow runs it again before publishing.

| Command | What it checks | When to run |
| --- | --- | --- |
| `npm run typecheck` | Source, stories, `.storybook/` and `scripts/` compile (no emit) | Any `.ts` / `.tsx` or tsconfig change |
| `npm test` | Unit suites (node and happy-dom) plus every story rendered in headless Chromium (Playwright; once per machine: `npx playwright install chromium`) | Any change under `src/` or `stories/` |
| `npm run build` | Compiles `src/` to `dist/` (JS, `.d.ts`, source maps) and copies the CSS beside it | Before `npm run test:package` or `npm pack`; after changing `tsconfig.build.json`, `scripts/` or the files under `src/` |
| `npm run test:package` | The built package as a consumer sees it (`test/`): every import style resolves through `exports` to `dist/`, declarations typecheck with `skipLibCheck` off, no case-only filename clashes | Any change to `package.json` `exports`/`files`, the build, or adding/renaming a module; needs `npm run build` first |
| `npm run build:storybook` | Storybook builds | Changes to `.storybook/`, `stories/` or story files |

CI uses `npm run test:coverage` in place of `npm test` (same tests, plus coverage). No two modules in one folder may share a name that differs only by case or by `.ts`/`.tsx`: both compile to the same `.js`.

## Versioning and releases

- Pre-1.0: below 1.0, a breaking change takes a **minor** bump and a feature or fix a **patch** bump. No prereleases during 0.x. 1.0.0 is the first release for people outside the suite.
- Changing what consumers get (components, props, exports, CSS, files) needs a changeset: `npx changeset`, commit the file under `.changeset/`.
- Never run `npm publish` or bump `version` by hand. The release workflow does both (README > Releasing).
- `RENOVATE_DISPATCH_TOKEN` and the `renovate` dispatch event type are a shared contract with `openflowfm/renovate`; don't rename them.
- `dist/` is build output and gitignored. A new import path consumers use needs an `exports` entry and a line in `test/package.test.ts`.

Every agent commit must end with a blank line and:

Co-authored-by: Codex <noreply@openai.com>
