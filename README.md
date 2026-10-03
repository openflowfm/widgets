# @openflow/widgets

Pre-1.0: unstable and in active development; expect breaking changes.

The controls a DAW is made of, built and iterated on outside the app they end up in.

This module exists because the device chain is coming, and after it a DAW of our own. A
knob written inside `set/src/components/` would take an `OpenFlow.MixerParameterState` within a
week and stop being reusable the moment it did. So the boundary is the point: **`widgets/`
imports no protocol, no bridge client, no `core/`, and nothing that knows Live exists.** It
takes a `Param` and a number.

That is the same rule `core/` has, turned the other way round — `core/` is domain logic
with no React, this is React with no domain.

## Where the reasoning lives

**Read the row you need, not the set.**

| doc | read it before touching | source |
|---|---|---|
| [the parameter model](docs/param-model.md) | what a control *is*, ranges, tapers, steps, how a value is spelled | `src/param/param.ts`, `format.ts` |
| [the gesture](docs/gesture.md) | dragging, the fine modifier, keys, write rate, the local-value hold | `src/gesture/*` |
| [the catalogue](docs/catalogue.md) | **adding a widget** — what exists, what's next, and what Max for Live does and doesn't tell you | `src/controls/*` |
| [the graph](docs/graph.md) | the node canvas, ports, cords, who owns a position — and the instrument the stories measure it with | `src/chrome/Graph.tsx`, `Port.tsx`, `graphContext.ts`, `stories/trace.ts` |
| [notation displays](docs/notation.md) | tablature, a piano roll, their timelines, or the app/widget boundary | `src/music/*` |
| [the palette](docs/palette.md) | the design language: colour tokens, the text ramp, the one typeface and its two cuts, size and shadow tokens | `src/palette.css`, `src/type.css`, `src/tokens.css` |
| [themes and color roles](docs/theme.md) | palettes, role rules, presets, scoped tokens and theme editing | `src/theme/*` |
| [the mixer face](docs/mixer.md) | controlled four-deck presentation and its host adapter | `src/mixer/*`, `stories/usePreviewMixer.ts` |
| [storybook](docs/storybook.md) | the dev harness, or adding a story to it | `.storybook/*`, `src/**/*.stories.tsx`, `stories/*` |
| [the debug module](docs/debug.md) | building a debugging page in an app: the frame, a time axis, plots, a transport | `src/debug/*` |

## The shape of it

```
src/
  param/
    param.ts        Param: kind, range, taper, steps, default — and the maths on it
    format.ts       how a value is spelled, when nothing more authoritative is
  gesture/
    useParamGesture.ts   the drag every continuous control shares
    usePendingValue.ts   showing what you just did until the engine agrees
    platform.ts          which key means fine
  controls/
    Widget.tsx      the frame every control sits in: caption, control, reading
    Knob.tsx        live.dial
    Slider.tsx      live.slider
    NumberField.tsx live.numbox
    Toggle.tsx      live.toggle, and live.button when momentary
    Segmented.tsx   live.tab
    Select.tsx      a compact enum with one member on screen
    Button.tsx      a plain push, for a verb rather than a parameter
    XYPad.tsx       two parameters on one plane, with a slot for a device's artwork
    Label.tsx       live.comment, and Divider for live.line
    arc.ts          dial geometry
    fill.ts         where a fill starts, shared by all three value controls
    hint.ts         which sentence the window's hint strip shows, and why a title counts
    wake.ts         the trail behind an arriving number, and the warmth in its reading
    reserve.ts      space for the longest reading, so a control never resizes
    shared.css      the parts every control is made of: face, type, states, layout
    controls.css    what's left after that — each control's own geometry
  chrome/
    Device.tsx      the shell a faceplate sits in, folded or open
    Chain.tsx       the run it sits in — children, so it never owns the order
    Graph.tsx       the canvas it sits on instead — the sibling layout, and the cords
    Port.tsx        where a cord ends. Two slots on Device, and nothing in a chain
    HintFooter.tsx  the strip along the bottom that says what you are pointing at
    graphContext.ts what a port and a node need from the surface under them
    Rack.tsx        a device holding chains: the macro face and the chain list
    Row.tsx         controls on one line, in three bands, through a subgrid
    Panel.tsx       aligned vertical parameter lanes, through a shared row grid
    chrome.css      their styling, on the same shared parts
  music/            what you play music with, as against what a device or a window is built of
    Transport.tsx   play, stop, loop, the tempo, the beat counter and the clock; no audio in it
    Meter.tsx       live.meter~, read-only
    Waveform.tsx    a stem as one silhouette, off a ladder of halvings, at the detail the window earned
    levels.ts       that ladder; outline.ts and spectralOutline.ts draw it, plain or by band
    Tablature.tsx   string lines, plain fret figures and quiet duration hairlines
    PianoRoll.tsx   keyboard rows, note blocks, musical ruling and a movable playhead
    notation.css    shared notation geometry; hosts supply musical meaning
  palette.css       the design language itself: surfaces, the text ramp, the accents,
                    the type stacks, the radii and the 22px control height. Every app
                    here imports it; DESIGN.md is what it means
  tokens.css        the widget tokens: colour and type from the palette, metrics ours
  index.ts          the barrel and the package entry — pulls in every stylesheet,
                    so prefer deep imports
  **/*.stories.tsx  Storybook, beside the widget each story shows. Never shipped
.storybook/         the harness config: the palette, the case card, the host-tokens switch
stories/            what the stories share. Dev-only; never built, never shipped
  parts.tsx         the card every story sits in, and the parameters they run on
  shells.tsx        a faceplate, a device shell, a run, a rack — what the chrome stories are built of
  trace.ts          the graph instrument — what the hand did, against what the graph made of it
  usePreviewMixer.ts  the silent four-deck simulation the mixer story runs on
```

## Running Storybook

```sh
npm ci
npm run dev              # http://localhost:5273 by default; a busy port moves up
```

Storybook is independent of the app repository and never connects to Live. Its
port remains configurable with `PORT`, `OPENFLOW_BENCH_PORT` or `OPENFLOW_PORT_BASE + 100`.

## Importing it

```sh
npm install @openflow/widgets
```

React and ReactDOM 19 are peers supplied by the host. Recursive is bundled locally
through this package's font dependency. Any bundler that handles CSS imports (Vite,
webpack, Rollup, esbuild, Parcel) works; nothing in the package needs compiling. Deep
imports are the API:

```ts
import { Knob } from '@openflow/widgets/controls/Knob.tsx';
import type { Param } from '@openflow/widgets/param/param.ts';
import '@openflow/widgets/palette.css';
```

Only the palette needs importing by hand: every control pulls `controls.css` in, and that
pulls `shared.css` and `tokens.css` behind it.

**The specifier carries the source file's TypeScript extension**, the name the file has in
this repository and in its docs. The published package is compiled: `npm run build` runs
`tsc` into `dist/` (JavaScript, `.d.ts` and source maps, with relative imports rewritten to
`.js`) and copies the stylesheets beside it, and the `exports` map sends
`controls/Knob.tsx` to `dist/controls/Knob.js` with its types in `dist/controls/Knob.d.ts`.
The source ships too, for the source maps. Two old paths still resolve:
`notation/*` (now `music/*`) and `controls/pointing.ts` (now `controls/pointingEngine.ts`,
renamed because compiled it would clash with `Pointing.js` on a case-insensitive disk).

Depend on a published version rather than a Git commit
(`github:openflowfm/widgets#<sha>`): a Git install has to build `dist/` on the
consumer's machine, which is what the npm package exists to avoid.

## Releasing

Pre-1.0 versioning: **below 1.0, a breaking change takes a minor bump (0.1.x → 0.2.0)
and a feature or a fix takes a patch bump (0.1.0 → 0.1.1).** There are no prereleases
during 0.x. 1.0.0 is the first release meant for people outside the suite.

Releases are automated with [Changesets](https://changesets.dev) and
`.github/workflows/release.yml`. Widgets versions are independent of the apps.

1. In any PR that changes what consumers get, run `npx changeset`, pick the bump by the
   policy above (patch, or minor for a breaking change) and describe the change. Commit
   the generated file in `.changeset/`.
2. When that PR merges, the release workflow runs the typecheck, the tests (the unit
   suites and every story in headless Chromium), the build, the package consumer check
   and the Storybook build, then opens (or updates) a **Version packages** PR that bumps
   `package.json` and writes `CHANGELOG.md`.
3. Merging the Version packages PR runs the same checks and publishes to npm with
   provenance, using npm trusted publishing (OIDC, no `NPM_TOKEN`), creates the GitHub
   release, then sends a `repository_dispatch` (`event_type: renovate`) to
   `openflowfm/renovate` so consumers get their update PRs straight away.

PRs opened by the workflow's `GITHUB_TOKEN` don't trigger CI; the Version packages PR only
touches the version and changelog, and the release workflow re-runs every check before
publishing.

### One-time setup (owner, by hand)

Do these in order, before merging the first Version packages PR:

1. **npm org.** Create the `openflow` organisation on npmjs.com if it doesn't exist, so
   the `@openflow` scope is yours.
2. **First publish by hand, under `next`.** Trusted publishers can only be configured on a
   package that already exists. From a clean checkout of `main`:
   `npm ci && npm login && npm publish --access public --tag next`
   This publishes the current pre-release (`0.1.0-rc.4`) under the `next` tag, so it never
   becomes `latest`. It carries no provenance: the release workflow turns provenance on
   (`NPM_CONFIG_PROVENANCE`) for every publish after this one.
3. **Trusted publisher.** On npmjs.com, package `@openflow/widgets` > Settings > Trusted
   publishing > GitHub Actions: organisation `openflowfm`, repository `widgets`, workflow
   `release.yml`, no environment. Optionally then set "Require two-factor authentication
   and disallow tokens".
4. **Actions PR permission.** In the repo's Settings > Actions > General, enable "Allow
   GitHub Actions to create and approve pull requests" (the Version packages PR needs it).
5. **Renovate dispatch secret.** Add a repository secret `RENOVATE_DISPATCH_TOKEN`: a
   fine-grained token with Contents read/write on `openflowfm/renovate` (what
   `repository_dispatch` requires). Without it the notify step is skipped and Renovate
   picks the release up on its schedule.

Then merge the Version packages PR: the workflow publishes `0.1.0` as `latest`.

## Who uses it

`set/`, `visuals/` and `mix/` all do. The first two go through one adapter each;
[`set/src/lib/liveParam.ts`](https://github.com/ryangavin/better-session-view/blob/main/set/src/lib/liveParam.ts) turns an `OpenFlow.MixerParameterState`
into a `Param`, and [`visuals/client/ui/param.ts`](https://github.com/ryangavin/better-session-view/blob/main/visuals/client/ui/param.ts) does the same
for a node's inlet. The mixer's volume, pan and send controls are driven by the gesture
hooks ([set/docs/mixer.md](https://github.com/ryangavin/better-session-view/blob/main/set/docs/mixer.md)); the device chain draws a track's devices
out of the chrome ([set/docs/device-chain.md](https://github.com/ryangavin/better-session-view/blob/main/set/docs/device-chain.md)); the visuals
designer draws its node canvas out of `chrome/Graph.tsx` and `chrome/Port.tsx`.

`mix/` needs no adapter, which is the interesting case: it has no Live and no protocol, so
it writes a `Param` literal where it wants a control and hands it a number. A stem's level
is a `float` from 0 to 1 and nothing else had to exist for the fader to work — see
[mix/docs/window.md](https://github.com/ryangavin/better-session-view/blob/main/mix/docs/window.md) for which controls it uses and why its fader
takes a `length` rather than `layout="inside"`.

**A whole stock device face is composed there too, and deliberately not here.** Live's EQ
Eight is [`set/src/components/devices/eq8/Eq8.tsx`](https://github.com/ryangavin/better-session-view/blob/main/set/src/components/devices/eq8/Eq8.tsx):
the parts are this module's, the arrangement of them is one particular device, and a module
that knows about no device can't hold one. See
[set/docs/device-faces.md](https://github.com/ryangavin/better-session-view/blob/main/set/docs/device-faces.md).

**Nothing here may import from `set/`, `bridge/`, `protocol/` or `core/`.** If a widget
needs something one of those has, it needs a prop instead.

## Verifying a change

`npm run typecheck` covers source and stories; `npm test` runs the widget suites and
renders every story in headless Chromium. The gesture and the menu are covered too, under happy-dom — but only where
there is an exact answer: what a lost capture does, what escape puts back, what a drag
measures against under a transform, which member a repeated letter walks to. **How a
gesture feels is still Storybook's** — the reach, the taper, whether the fine modifier is
worth the finger — so a change to a control should still say which story it was checked in.

`npm run build` then `npm run test:package` check the package a consumer gets: every
import style the apps use resolves through the exports map to a file in `dist/`, the
declarations typecheck with `skipLibCheck` off, and no two shipped files differ only by case.
