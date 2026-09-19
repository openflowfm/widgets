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

**The canvas holds the widget and nothing else.** What a story is *for* is a sentence, and
a sentence belongs on the docs page rather than under the thing it describes: `note('…')`
from `stories/parts.tsx` is a story parameter that sets `docs.description.story`, and each
file's meta sets `docs.description.component` for the widget as a whole. Controls and
chrome carry the `autodocs` tag, so each has a docs page with its prop table and every
story on it.

Where a component's props *are* the story — a device's name and fold, a chain's drop mark,
a waveform's window — the story is its args, with a control apiece: ranges for numbers,
select or radio for enums, booleans for flags, and `fn()` from `storybook/test` for
callbacks. A controlled prop stays live through `useArgs()` from `storybook/preview-api`,
so a press writes the arg back rather than doing nothing. Composite stories that are a
whole scene keep a `render`, and still take args for whatever the scene is varying.

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
exponent or step count — they are the story's args, so the controls panel is the host —
and watch a knob, a slider and a number field all change together, with the raw value and
the formatted string printed underneath. It is the fastest way to
check a formatter, and it makes the model-first design visible — you are changing the
parameter, not the widget.

## Themes, host tokens, and the Tokens page

Two toolbar items change what a widget looks like from outside it, and a docs page shows
the result.

**Theme** is `@storybook/addon-themes`, wired in `.storybook/preview.tsx` with
`withThemeFromJSXProvider`: the picker wraps every story in a `ThemeRoot` carrying one of
the presets from `src/theme/theme.ts`, and sets the same resolved tokens on the document
element so the page around the story — the body, a docs table, the portal a menu or modal
opens into — follows too. The default is the default theme, which is what the apps mount;
*none* is the palette as shipped, with no theme over it, and is where the shipped amber
comes from. A story can pin one with `parameters.theme`, and since the vitest runner
honours globals, a pinned theme is a themed test. **Theme / Editor** mounts the editor
beside a sample of what it colours, with the document as its arg.

**Host tokens** is the other question. `src/tokens.css` defines every colour and type token
as `var(--host-token, fallback)`, so a widget picks up the app's palette when it's mounted in
the app and uses its own when it isn't. The metrics below them — height, track, gap — are
the widget's own and take no host token, because a control's size is the module's decision;
a host that wants them different sets `--wdg-height`, `--wdg-field-height` and the rest
directly. *Off* sets every palette and type token to `initial` on a wrapper, which makes
each one guaranteed-invalid inside it and lets the fallbacks show. The token names come
from the stylesheets themselves (`stories/tokens.ts` reads them off `palette.css`, `type.css`
and `tokens.css` as text), so the switch cannot drift from what the palette declares. A
widget that looks right only with host tokens present is a widget that will look wrong the
first time it's used anywhere else.

**Tokens**, at the top of the sidebar, is `stories/Tokens.mdx`: every preset resolved to
the strings a `ThemeRoot` sets, the type scale, and a table per layer — palette, type,
widget. The tables are live: each value is read off the page with `getComputedStyle`, so
changing the theme or the host-tokens switch changes what they show. That is the page to
read before adding a token, and the page that says whether a host has actually reached one.

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

Add it to the widget's `*.stories.tsx`. `note` and the made-up parameters every story runs
on are in `stories/parts.tsx`; the shells the chrome stories are built of, and `Held` for a
control inside one that has to hold its own value, are in `stories/shells.tsx`. Write the
note as what the story is *for*, not what the control is — "four steps across the range,
Max's own worked example" earns its space; "a knob" doesn't. Every new widget needs at
least a default story and a disabled one.

```tsx
export const Stepped: Story = {
  parameters: note("Four steps across the range — Max's own worked example."),
  args: { param: STEPPED },
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
