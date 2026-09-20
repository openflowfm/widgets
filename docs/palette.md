# The palette

The design language every open[flow] app imports: `src/palette.css`, and `src/type.css`
behind it. These are the choices already made; a token is added here when a second app
needs it, and not before.

## Foundations

- The interface uses dark surfaces. Semantic color tokens live in
  [`src/palette.css`](../src/palette.css): neutral foregrounds and borders,
  amber for selection, active toggles and primary actions, green for playback and success,
  blue for Solo, red for errors, and purple for previews. They sit there rather than in an
  app because more than one app reads them —
  [`src/tokens.css`](../src/tokens.css) was already reading them from the
  host with fallbacks, and mix[flow] was the second app to need the same table.
  set[flow]'s `shared.css` imports it and adds what is only that app's: the stacking
  tiers and the grid column widths.
- Neutral text comes from one five-step ramp, described under *Text* below.
- **One typeface, two cuts.** Both stacks start with Recursive, a variable font bundled
  at [`src/type.css`](../src/type.css) — the only place in the suite that
  names a family. `--mono` is used for compact labels, facts and grid headings; `--sans`
  for prose. They are the same font: the difference is the `MONO` axis, carried in
  `--mono-axes` and `--sans-axes`, because a custom axis cannot ride inside a
  `font-family` and `@font-face` can only pin the registered ones. So a rule that reaches
  for `var(--sans)` pairs it with `var(--sans-axes)`; everything else inherits the
  monospaced cut from the root. `CASL` is held at 0.38 for both, which is the warmth.
  The font is self-hosted rather than pulled from a CDN, because these are desktop apps
  and one of them runs a show.
- **Size, weight and tracking are tokens, named for the job.** Seven sizes replace the
  thirty literal values the stylesheets had grown:
  `--text-annot` 8px is the readout on a control — a pan value, an
  EQ status, a node kind; `--text-label` 9px names a thing — chips, field names, column
  heads; `--text-control` 10px is the text inside operable chrome; `--text-body` 11px is
  list and table content; `--text-lead` 12px is primary and editable text; `--text-heading`
  14px and `--text-title` 18px are headings and view titles. Weight is
  `--weight-normal|medium|strong|bold`, tracking is
  `--track-tight|none|slight|label|caps`. Every value is one the apps were already using,
  so adopting a token changed nothing on screen — what it changed is that there is now one
  file to move them from.
- **Shadow is four concepts, not a value per component.** `--ring` and `--ring-out` are
  the same hairline outline drawn inside and outside the box; `--edge-top`, `--edge-bottom`
  and `--edge-left` are the drop-target and picked markers; `--shadow-menu` and
  `--shadow-modal` are the only two elevations, and `--shadow-lift` is the fade above a
  docked bar. They carry geometry only — the colour is appended at the call site, because
  a custom property substitutes as text: `box-shadow: var(--ring) var(--amber-muted)`
  resolves to `inset 0 0 0 1px #927b51`. Without that, a ring would need a token per
  colour, which is how thirty-six distinct shadows happened.
- **A stylesheet reaches the tokens by importing the palette, not by re-declaring them.**
  [`src/palette.css`](../src/palette.css) is the only definition; it pulls in
  `type.css` itself, so importing the palette is enough. Re-declaring a token with the same
  value is drift waiting to happen — visuals and the widget bench each kept a private copy
  until they didn't. This package is the exception on purpose: its controls read `--wdg-*` aliases so
  they still work inside a host that has none of this.
- Rectangular corners share `--radius` (2px) in the palette: buttons, joined groups,
  panels and artwork. The old `--radius-xs/sm/md/lg` names are compatibility aliases
  to that single value; circles and `--radius-pill` retain their geometry. Change
  `--radius` at the palette root to change all those corners together.
  Header controls share a 22px height
  and are vertically centered with equal space above and below. Both are in the palette,
  so a control is the same height in every app here.
- **An app's own colors are roles, and they stay in that app.** mix[flow] paints six
  sources and names them `--stem-vocals` and so on rather than by hue, in
  mix[flow]'s own `tokens.css`; three of the six *are* palette accents. A role moves into the
  palette when a second app needs it, and not before.

## Text

Neutral text comes from one five-step ramp. The steps are named for the job the text is
doing rather than for how bright they are, so picking one is a question about the content:

| Token       | For                                                             |
| ----------- | --------------------------------------------------------------- |
| `--fg`      | the thing being read: names, current values, the active control |
| `--ui`      | ordinary interface text: control faces, headings, row text      |
| `--detail`  | supporting facts: stats, units, flags, annotations              |
| `--caption` | micro-labels, hints, placeholders, empty states                 |
| `--idle`    | a control at rest that shouldn't call attention to itself       |

No rule defines its own neutral ink: every `color` either names a step or derives from a
Live color. Text recedes by taking the next step down, and `opacity` is left to mean that
a whole control is disabled.

`--fg` is the top of the ramp rather than its default. A screen where several things claim
it is one where nothing reads as primary, so hover, focus and selection are most of what
earns it.
