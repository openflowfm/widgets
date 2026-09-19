# Storybook

The harness: every control in every state, with no app around it. Stories sit beside the
widget they show — `src/controls/Knob.stories.tsx` next to `Knob.tsx` — and what they share
lives in `stories/`. Nothing from either ships in the package.

```sh
npm ci
npm run dev              # http://localhost:5273
npm run build:storybook  # the static site CI builds as a smoke check
```

## Ports, and the one shared thing that isn't

The port counts from the same base every dev server here does — `OPENFLOW_PORT_BASE`
moves both, and `OPENFLOW_BENCH_PORT` overrides it outright. **The offset is 100, not 1**,
because worktree ports get picked adjacently: with +1, a worktree on 5174 would put its
Storybook on the UI of the worktree on 5175. `--exact-port` is on, so a genuine collision
fails loudly rather than drifting.

| | default | |
|---|---|---|
| set[flow] | 5173 | `OPENFLOW_PORT_BASE` (the base itself) |
| widget storybook | UI + 100 | `OPENFLOW_BENCH_PORT` |
| device bench | UI + 200 | `OPENFLOW_DEVICE_BENCH_PORT` |

The device bench is [`set/bench/`](https://github.com/ryangavin/better-session-view/blob/main/set/docs/device-faces.md#the-device-bench) and holds
the faces, which are composed in the app. Same offset reasoning at +200: a worktree keeps
all three of its servers clear of the next worktree's.

The subtler one: **Storybook names its own Vite `cacheDir`**, `node_modules/.vite/storybook`.
When multiple Vite servers share an installation and a cache directory, each decides the
other's cache is stale and re-optimizes on every start — a browser full of
`504 Outdated Optimize Dep` waiting to happen.

## Why it's here rather than in the app

Iterating on a knob inside the session view means opening a set, opening the mixer, and
reasoning about a control while 848 rows of unrelated state are also on screen. A story
shows one variant with nothing else on screen, including the ones that are annoying to
reach in the app: a disabled control, a parameter at its extremes, a taper you'd never set
on a real device.

It also proves the boundary. The stories import `src` and nothing else — no bridge,
no protocol, no `core/`. If a widget ever needs something from the app, Storybook stops
building, which is the earliest possible warning.

## What's on it

The sidebar is grouped by what you came to look at rather than by what the file tree says:

| group | for |
|---|---|
| **Controls** | things you put a hand on — a story per state of each control |
| **Chrome** | what a window is built out of: text, rows, device shells, chains, the modal |
| **Graph** | the canvas, and whether it behaves — an instrument, not a page of cases |
| **Drawing** | over a length of time: the waveform |
| **Mixer** | a complete four-deck composition on a silent simulation |
| **Debug** | the harness module, one widget at a time and then all together |
| **Param** | the model playground |

Most stories are a card with a note under it saying what the story is *for*, each genuinely
live and holding its own value. The note is a story parameter — `note('…')` from
`stories/parts.tsx` — so the same sentence is printed under the card in the canvas and as
the story's description on its docs page. Controls and chrome carry the `autodocs` tag,
so each has a docs page with its prop table and every story on it.

**Graph is the exception, and is an instrument rather than a page for a reason.** A knob is
right or wrong in a screenshot; a canvas is not. A cord that lands nine times out of ten
looks exactly like one that lands ten times out of ten, so those stories carry an instrument
instead of more cases — see [the graph](graph.md#where-to-work-on-it) for what it counts and
why. It lives in `src/chrome/Graph.stories.tsx` and `stories/trace.ts`.

**A whole stock device face is not on this page**, and the omission is the boundary again.
Composing one means naming a particular device, and a page that reproduces Live's EQ Eight
is a page that has to be right about Live's EQ Eight — which is a claim this module makes
about none of them. The face is composed in the app instead, out of these parts:
[`set/src/components/devices/eq8/Eq8.tsx`](https://github.com/ryangavin/better-session-view/blob/main/set/src/components/devices/eq8/Eq8.tsx),
reasoned about in
[set/docs/device-faces.md](https://github.com/ryangavin/better-session-view/blob/main/set/docs/device-faces.md). What Storybook owes it is the
parts: a knob at every taper, a `Panel`'s aligned lanes, a `Device` shell folded and open.

**The model playground** is the point of the whole harness. Change the unit style, range,
exponent or step count and watch a knob, a slider and a number field all change together,
with the raw value and the formatted string printed underneath. It is the fastest way to
check a formatter, and it makes the model-first design visible — you are changing the
parameter, not the widget.

## The host-tokens switch

`src/tokens.css` defines every colour and type token as `var(--host-token,
fallback)`, so a widget picks up the app's palette when it's mounted in the app and uses
its own when it isn't. The metrics below them — height, track, gap — are the widget's own
and take no host token, because a control's size is the module's decision; a host that
wants them different sets `--wdg-height`, `--wdg-field-height` and the rest directly.

The **Host tokens** item in Storybook's toolbar adds and removes the app's palette from the
page, so both halves of that chain can be seen. It is a toolbar global in
`.storybook/preview.tsx`: the palette is imported as text and mounted in a `<style>`, because
a stylesheet Vite has injected cannot be taken out again. A widget that looks right only
with host tokens present is a widget that will look wrong the first time it's used anywhere
else.

The preview stylesheet also locally overrides the primary accent tokens (`--amber` and its
hover/muted variants) with silver-blue. This is the fallback when the mixer's theme editor is
not mounted; the theme editor scopes its override to the mixer composition.

## What it doesn't do

No connection to Live, and there won't be one — that's what makes it worth having.

Stories are not shipped in the package: `files` in `package.json` leaves out
`src/**/*.stories.tsx`, `tsconfig.build.json` excludes them from the declarations, and
coverage ignores them. CI builds the static site as a smoke check, and `npm run typecheck`
covers the stories and `.storybook/`.

## Stories as tests

`npm test` runs two vitest projects. `unit` is the suites with an exact answer, under node.
`stories` is `@storybook/addon-vitest`: every story rendered in headless Chromium through
playwright, failing if it throws. That is the test a widget's *look* gets — a story that
stops rendering fails CI rather than waiting for somebody to open the page — and it is why
every new widget needs at least a default story and a disabled one. The feel is still yours
to check by hand.

CI installs Chromium with `npx playwright install --with-deps chromium` before the tests;
locally, playwright's own install does it once.

**The addon is a version ahead of its peer range.** Storybook 10.6 declares vitest 3 or 4
and this repo is on 5; the addon runs fine on it, and `.npmrc` sets `legacy-peer-deps` so
`npm ci` accepts the mismatch. Storybook 11 lists vitest 5 as a peer, so when it ships, take
the `.npmrc` line out with the upgrade.

## Adding a story

Add it to the widget's `*.stories.tsx`. `Held`, `note`, and the made-up parameters every
story runs on are in `stories/parts.tsx`; the shells the chrome stories are built of are in
`stories/shells.tsx`. Use `Held` so the story has its own value, and write the note as what
the story is *for*, not what the control is — "four steps across the range, Max's own worked
example" earns its space; "a knob" doesn't. Every new widget needs at least a default story
and a disabled one.

```tsx
export const Stepped: Story = {
  parameters: note("Four steps across the range — Max's own worked example."),
  render: () => <Held param={STEPPED}>{(v, set) => <Knob param={STEPPED} value={v} onChange={set} />}</Held>,
};
```

A story that renders its own tree rather than taking args is typed `StoryObj` rather than
`StoryObj<typeof meta>`, which would demand the component's required props as args. A story
that *does* take args gets the type, and its meta carries `args` defaults so the required
ones are met.

## Adding a group

A group is the first segment of a story's `title` — `Controls/Knob`. The order of the groups
is `storySort` in `.storybook/preview.tsx`; a new group goes on that list or lands at the end.

## Mixer: a complete composition

The **Mixer** story mounts `src/mixer/MixerView.stories.tsx`, a thin wrapper around the
reusable `src/mixer/MixerView.tsx` and `stories/usePreviewMixer.ts`. The view's contract and
integration boundary are documented in [mixer.md](mixer.md). The same controlled face
can be driven by a future mix adapter without importing the simulation into the app.

The preview hook owns the fictional songs, sections and peaks, queued launches, source
switching, loop decisions, simulated clock and meters. The face receives state, semantic
commands, parameter definitions, resolved theme colors and a read-only frame sampler.
The face does not advance the clock or decide that a launch succeeded. Playheads and
meters update independently at animation-frame cadence; the rest follows host state.

Run starts the silent simulation; 1 bar queues changes, Now applies them immediately.
Pause holds pending choices. Stop clears selections, queues, loops and position. In/Out
mark a global preview loop, and Exit/Reloop release or re-engage it. Full selects the
first active stem section for the original-track preview and preserves stem selections
for returning. These are fixture policies, not behavior implemented by MixerView.
Remounting the story restores the initial composition and theme. No audio is produced.

## Mixer theme roles

The mixer story mounts a shared `ThemeRoot` and controlled `ThemeEditor` from
`src/theme/`. The [theme topic](theme.md) owns the role model, palette rules, presets,
randomization and derived label/deck colors. The story owns only its floating Theme button
and temporary state. The editor is the same component used in mix's app-wide Theme modal.

Current favorite preserves the chosen palette. Presets include all role colors, surfaces
and deck variation; selecting a preset restores that whole document. Randomize and
individual H/S/L rolls retain variation. Leaving the story discards theme edits along with
the preview. No theme state is written to body or browser storage by widgets.

The editor also has **Roll hue**, **Roll sat**, and **Roll light** for the selected
role. Each changes only that component. Hue rolls seek a separated hue family; primary
stays nearly neutral and signal stays green. Saturation and lightness rolls use restrained
ranges; manual fields remain available for wider experimentation.

Four live sliders control deck variation: **B/D warmth offset** (negative cooler,
positive warmer), **B/D saturation offset**, **B/D lightness offset**, and **Waveform
color strength**. The first three change B/D relative to the A/C base colors, together
for both pairs. Strength controls how much deck color appears in all waveform fills.
**Reset variation** restores warmth 8, saturation/lightness offsets 0, and strength 65%.
Changing presets restores their saved variation; rolling role colors preserves it.
