# Themes and color roles

`src/theme/theme.ts` owns serializable v1 theme documents, named HSL roles, presets,
validation and editing rules. `resolve.ts` turns a document into CSS tokens and resolved
colors. `ThemeRoot.tsx` applies them to one subtree; `ThemeEditor.tsx` edits a supplied
document through `onChange`. No part of this module reads storage or knows an app exists.

```tsx
import { ThemeRoot } from '@openflow/widgets/theme/ThemeRoot.tsx';
import { ThemeEditor } from '@openflow/widgets/theme/ThemeEditor.tsx';
import { DEFAULT_THEME } from '@openflow/widgets/theme/theme.ts';

const [theme, setTheme] = useState(DEFAULT_THEME);
return <ThemeRoot theme={theme}>
  <ThemeEditor theme={theme} onChange={setTheme} />
  <MyInterface />
</ThemeRoot>;
```

## The document and the rules

A theme includes `colors`, `surfaces`, `variation` and optional `spectral` settings. Presets restore them together;
randomizing role colors retains surfaces and variation. Current favorite preserves the
chosen eight original role colors exactly, with guitar and piano added for six-source
hosts. These additional roles do not change any of the existing four-stem colors.

- `primary` is selection and ordinary control change: every fill, the on state of a
  toggle, the chosen segment. It supplies faders, trim, EQ and effects, which have no
  separate hue identity. The presets keep it nearly neutral, and a roll keeps it there,
  but that is a choice the document makes, not a rule: any hue and saturation is valid.
  Markers — a knob's pointer, a slider's thumb, a pad's handle, a device's power dot —
  are the text colour, not a role of their own. `signal` is measured output and stays
  green, 120–160°.
- Six stem identities are drums, bass, other, vocals, guitar and piano. Active fills
  use their role directly; labels use `identityLabel`, 45% ink blended with the caption
  tone. This is a quieter version of the color, not plain gray.
- Left/right are physical deck families. A/C use the base tone; B/D receive the shared
  warmth, saturation and lightness offsets. Waveform strength blends their colors with
  `surfaces.waveformBase`. The defaults change hue only, preserving equal emphasis.
- Surfaces include the text/border ramp, control and timeline surfaces, focus and
  status roles. Danger, success, information and caution are distinct semantics from
  measured signal. Caution is the warm one, for a control that is holding or auditioning
  rather than failing; deck Cue reads it. Their defaults stay stable while the identity
  randomizer experiments.

Randomize deals nine spaced hue families to signal, six stems and two deck sides.
Individual H/S/L rolls change only one channel. A hue roll chooses a separated degree
where possible; if a manually crowded palette has none, it chooses a maximally separated
one. Manual edits remain possible, with advisory warnings when base stem hues are
within 30° of another saturated identity/signal role. This is not a contrast or color-
vision certification: it does not evaluate status colors or derived deck variants.
Saved favorites are preserved even when the warning flags a collision.

Color encodes state as well as identity. Neutral EQ/trim/filter do not draw filled arcs;
level controls always show their amount. Those are control presentation choices, not
changes to the palette resolver or musical state.

## Spectral waveform style

`spectral.ts` owns frequency paint independently of stem identity. The optional v1
`spectral` field contains Spectral/Deck color mode, low/mid/high HSL colors and strength.
Older saved themes without the field use RGB without losing their existing palette;
malformed supplied settings are rejected. RGB preserves the original waveform paint.
Warm and Ice offer alternate palettes without changing any other theme role.

The editor's Low/Mid/High buttons select a band for the same H/S/L values and individual
roll buttons as the identity roles. These are frequency semantics, so they are not
subject to stem hue-separation rules. The main identity randomizer preserves spectral
settings. Strength blends band paint toward the theme's neutral waveform base; zero
keeps the amplitude silhouette. Deck color mode instead uses the paired deck tint.

`Waveform` accepts measured `spectrum` tuples, one low/mid/high energy triple per peak.
It derives paint from the scoped theme and repaints while paused. Hosts retain energy
measurements rather than storing palette-dependent colors, so editing a theme never
requires re-analysis, loading audio, or restarting playback. `--spectral-low/mid/high`
expose the band colors to other consumers; `useTheme().spectral` exposes the complete style.

## Consumption and scope

DOM controls inherit `--primary`, `--signal`, the surfaces and `--stem-<id>` /
`--stem-<id>-label`. `--deck-a` through `--deck-d` and their `-waveform` tokens expose the
paired identities. `useTheme()` returns resolved colors, tokens and deck pairs to code
that needs actual colors. It does not expose setters or cause audio work.

ThemeRoot imports the base palette for type/metrics and sets colors on its own div.
Nested and sibling roots are independent, with no body/document mutation. Dialogs and
popovers remain descendants, including in the browser top layer, so they inherit the
same tokens. A host that portals elsewhere must provide an appropriate theme boundary.

Canvas pixels do not follow CSS inheritance automatically. Shared Waveform subscribes
to the lightweight theme context and schedules a redraw on a theme change, even while
paused. The context lives separately from the root so subscribing does not import global
styles into an otherwise unthemed widget. Other canvas hosts must do the same, or pass
resolved colors as changing props. Never remount playback to repaint a theme.

The resolver supplies legacy `--amber` / hover / muted and red/green/blue aliases for
existing callers. New consumers should use semantic names. `--amber` resolves to the
primary, so a caller that wants warmth regardless of the palette wants `--caution`
(with `--caution-hover`) instead. Unthemed apps retain their
existing palette defaults; this is not a global recoloring of every app. Widget fills
prefer `--primary`, falling back to `--amber`; explicit `ink` props still take precedence.

The editor has no floating position, disclosure or persistence policy. Bench owns its
floating Theme button. Mix uses a modal and owns `mix.theme.v1` local storage; `isTheme`
validates the complete document before restoration. Different app origins do not share
browser storage. Applications can serialize the same document through their own settings
or file APIs without adding storage dependencies to widgets.

## Rectangular corners

The shared palette owns `--radius: 2px`, the existing ordinary button rounding.
`--radius-xs/sm/md/lg` remain aliases for existing app styles, including artwork;
widget control, plate and modal aliases read the same value. Set the palette-root
`--radius` once to change rectangular corners across consumers. Joined controls
keep zero-radius internal corners and use the token only on their outer corners.
Circles, knob geometry and pill indicators remain distinct. This is a CSS theme
token, not a new serialized color-theme field or editor setting.

## Verification

A stored document written before a surface existed keeps its other choices: validation
accepts absent surface keys and the resolver fills them from the defaults, so adding a
role does not reset a saved theme. Malformed values are still rejected.

Theme tests cover complete document validation, preset preservation, role constraints,
six-stem randomization, derived treatments and nested scope. Root tests verify changing
resolved values without remounting children or writing body styles. Mix tests cover
storage validation. Check actual canvases and popup styles in both browser harnesses;
unit tests alone cannot establish visual cohesion.

## Optional waveform presentation

`music/Waveform.tsx` accepts `presentation: SpectralOutlineStyle` alongside measured
`spectrum`. Omit it to retain the existing theme output unchanged. Geometry continues
to use the same peak ladder, zoom density, `smooth` and `headroom` parameters.
`music/spectralOutline.ts` exposes `paintSpectralOutline` for canvas hosts using that
same geometry. Both entry points use this painter, rather than separate demo renderers.

`layout` chooses nested frequency layers or a blended spectrum. `spectral` supplies
the existing low/mid/high HSL palette and neutral-to-color strength; `weights` changes
relative band prominence without changing the outer amplitude. Layers divide height
by weighted energy shares, not additive band peaks. `edge` controls the opacity of an
inward-clipped one-pixel highlight. Measured zero-energy intervals stay empty even
when cubic tangents cross neighboring bins. The shared cubic may round or overshoot
between samples; smoothing is a presentation choice, not a new measurement.

The caller owns analysis, style persistence and presets. No audio gain, frequency
crossovers, production defaults or global theme values are changed by this API.

The optional finish fields `fillOpacity`, `colorCurve`, `edgeTint` and `background`
control translucency, spectral contrast, a white or frequency-colored outline, and
canvas backing. Defaults retain opaque fill, the original 0.5 spectral exponent,
a white edge and transparent backing. `spectralPainter` accepts the same optional
exponent as a fourth argument; its existing callers retain the original curve.
These fields never create an inner amplitude contour. Translucent frequency layers
use disjoint rings, so overlapping fills cannot invent a brighter center.

### Prism waveform treatment

The Spectral palette selector includes opt-in **Prism**. Its serialized `waveform`
field supplies blended geometry, detail 2, smoothing .35, headroom .86, opaque fill,
white edge .8788055, curve 2.114115 and RMS weights [.85,1,1.8]. RGB hues use
100% saturation and lightness [50,46,46]. It has no special background. Existing
v1 themes and the RGB default are unchanged. Explicit Waveform presentation and
geometry props still override theme choices. Treatment paint converts cached
mean-square band energy to RMS before applying weights; analysis is never rerun.
`waveformPainter` applies the same color treatment to small previews and honors
Deck mode with neutral paint when a preview has no assigned deck. Theme consumers
must retain numeric measurements and derive paint when the scoped theme changes.

The selector also offers **Aurora** (hues 275/95/185, lightness 30/25/19) and
**Ember** (22/325/225, lightness 27/23/28), both saturation/strength 100, opacity .88,
curve 2.3, spectral edge (.88 Aurora, .9 Ember) and background #090913. Both retain
Prism's geometry and RMS weights. These optional treatments preserve the chosen
Spectral/Deck mode and all saved themes; selection is always explicit.

A waveform drawn on a scrolling strip can supply `visibleShare` to select geometry
density from the actual visible fraction. Mixer frames provide their viewport/strip
ratio; a whole-strip canvas no longer implies a whole-track zoom. Detail still uses
the existing bounded envelope ladder, and ordinary frame scrolling only translates
the cached strip; it does not rebuild the waveform or apply smoothing to the audio.
