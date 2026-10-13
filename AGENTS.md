# Widgets

Read README.md as the topic index, then only docs matching the change.
Widgets takes props and numbers: no Live, protocol, bridge, core or application imports. Use real TypeScript extensions for imports. Nothing loads from a CDN. Update the governing topic doc whenever functionality changes.

Use Storybook (`npm run dev`) for gesture and visual changes; say which story was actually checked. A new widget gets a stories file beside it, with at least a default and a disabled story.

## Checks

Run `npm ci` once per worktree. A change runs only `npm run build` and `npm run typecheck`. Everything else runs in a test pass (when asked, or before a PR, each check once) and on CI (`.github/workflows/ci.yml`, every push and PR); the release workflow runs the full list again before publishing. Tests are written to a spec as their own step, not as part of a change.

| Command | What it checks | When to run |
| --- | --- | --- |
| `npm run typecheck` | Source, stories, `.storybook/` and `scripts/` compile (no emit) | After any change |
| `npm run build` | Compiles `src/` to `dist/` (JS, `.d.ts`, source maps) and copies the CSS beside it | After any change; before `npm run test:package` or `npm pack` |
| `npm test` | Unit suites (node and happy-dom) plus every story rendered in headless Chromium (Playwright; once per machine: `npx playwright install chromium`) | Test pass and CI |
| `npm run test:package` | The built package as a consumer sees it (`test/`): every import style resolves through `exports` to `dist/`, declarations typecheck with `skipLibCheck` off, no case-only filename clashes | Test pass when `package.json` `exports`/`files`, the build, or a module's name changed, and CI; needs `npm run build` first |
| `npm run build:storybook` | Storybook builds | Test pass when `.storybook/`, `stories/` or story files changed, and CI |

CI uses `npm run test:coverage` in place of `npm test` (same tests, plus coverage). No two modules in one folder may share a name that differs only by case or by `.ts`/`.tsx`: both compile to the same `.js`.

## Versioning and releases

- Pre-1.0: below 1.0, a breaking change takes a **minor** bump and a feature or fix a **patch** bump. No prereleases during 0.x. 1.0.0 is the first release for people outside the suite.
- Changing what consumers get (components, props, exports, CSS, files) needs a changeset, once per PR (not per change): `npx changeset`, commit the file under `.changeset/`.
- Never run `npm publish` or bump `version` by hand. The release workflow does both (README > Releasing).
- `RENOVATE_DISPATCH_TOKEN` and the `renovate` dispatch event type are a shared contract with `openflowfm/renovate`; don't rename them.
- `dist/` is build output and gitignored. A new import path consumers use needs an `exports` entry and a line in `test/package.test.ts`.

Every agent commit must end with a blank line and:

Co-authored-by: Codex <noreply@openai.com>
