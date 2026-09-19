# @openflow/widgets

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
| [notation displays](docs/notation.md) | tablature, a piano roll, their timelines, or the app/widget boundary | `src/notation/*` |
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
    Meter.tsx       live.meter~, read-only
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
  notation/
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
npm run dev              # http://localhost:5273
```

Storybook is independent of the app repository and never connects to Live. Its
port remains configurable with `OPENFLOW_BENCH_PORT` or `OPENFLOW_PORT_BASE + 100`.

## Importing it

Install `@openflow/widgets` from a full Git commit for reproducible consumption:

```sh
npm install 'github:openflowfm/widgets#<full-commit-sha>'
```

React and ReactDOM 19 are peers supplied by the host. Recursive is bundled locally
through this package's font dependency. Existing deep imports remain the API:

```ts
import { Knob } from '@openflow/widgets/controls/Knob.tsx';
import type { Param } from '@openflow/widgets/param/param.ts';
import '@openflow/widgets/palette.css';
```

Only the palette needs importing by hand: every control pulls `controls.css` in, and that
pulls `shared.css` and `tokens.css` behind it.

**The specifier carries the real TypeScript extension**, because that is the file that is
actually there — `exports` maps straight onto `src/`, and nothing is compiled in between.
Vite and `tsc` both consume the source, so there is no build step between this module and
the app that uses it, and no `dist/` to go stale while you work.

`npm run build` emits declarations into `dist/`; `npm pack` builds them before
packing. Git consumers use the TypeScript source directly and need a bundler such
as Vite that handles TS/TSX and CSS. No install-time build is required.

CI runs typechecking, tests with coverage, declarations and a Storybook build. Tags
matching the package version produce a GitHub release with a package tarball;
Widgets versions and releases are independent of the apps.

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
