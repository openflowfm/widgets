import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useEffect, useRef } from 'react';
import { ThemeRoot } from './ThemeRoot.tsx';
import { PRESETS, ROLES, ROLE_NAMES, DARK_SURFACES, DEFAULT_THEME, color, conflicts, editRole, type Theme, type Tone, type ColorRole, type DeckVariation } from './theme.ts';
import { SPECTRAL_PRESETS, SPECTRAL_BANDS, SPECTRAL_NAMES, DEFAULT_SPECTRAL, type SpectralBand } from './spectral.ts';
import { Knob } from '../controls/Knob.tsx';
import { Meter } from '../controls/Meter.tsx';
import { Slider } from '../controls/Slider.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { Button } from '../controls/Button.tsx';
import { Segmented } from '../controls/Segmented.tsx';
import { Select } from '../controls/Select.tsx';
import { NumberField } from '../controls/NumberField.tsx';
import { XYPad } from '../controls/XYPad.tsx';
import { Label } from '../controls/Label.tsx';
import { Row } from '../chrome/Row.tsx';
import { Waveform } from '../wave/Waveform.tsx';
import { packedOf, type Peak } from '../wave/levels.ts';
import { Held, Run } from '../../stories/shells.tsx';
import { DRY_WET, FILTER, FREQ, GAIN, PAN, SHAPE, TIME } from '../../stories/parts.tsx';

/**
 * The theme is its document, so the story is that document as args.
 *
 * A `Theme` is roles, surfaces, deck variation and a spectral style. Each of
 * those is flattened into the controls panel — a colour picker per role and
 * surface, a range per offset — under a category of its own. *Preset* restores
 * every one of them at once, and the document the panel currently describes
 * sits under the sample, ready to be pasted into `theme.ts` as a new preset.
 *
 * The rest of the canvas is what the theme lands on: every control, a chain
 * of shells, a waveform per stem, the deck letters and the spectral bands.
 */

type SurfaceKey = keyof typeof DARK_SURFACES;
const SURFACES = Object.keys(DARK_SURFACES) as SurfaceKey[];
const VARIATION: { key: keyof DeckVariation; min: number; max: number }[] = [
  { key: 'warmth', min: -40, max: 40 },
  { key: 'saturation', min: -30, max: 30 },
  { key: 'lightness', min: -20, max: 20 },
  { key: 'strength', min: 0, max: 100 },
];

/* Colour pickers speak hex; the document speaks HSL. */
const hexOf = ({ h, s, l }: Tone): string => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
const toneOf = (hex: string): Tone => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex);
  if (!m) return { h: 0, s: 0, l: 50 };
  const [r, g, b] = m.slice(1).map((two) => parseInt(two, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
};

/** The panel's shape: one flat key per thing a colour picker or range can hold. */
type ThemeArgs = { preset: string; spectralPreset: string; spectralMode: 'spectral' | 'deck'; spectralStrength: number }
  & Record<ColorRole, string> & Record<SurfaceKey, string> & Record<keyof DeckVariation, number>
  & Record<`spectral_${SpectralBand}`, string>;

function flatten(theme: Theme): Omit<ThemeArgs, 'preset' | 'spectralPreset'> {
  const spectral = theme.spectral ?? DEFAULT_SPECTRAL;
  return {
    ...(Object.fromEntries(ROLES.map((role) => [role, hexOf(theme.colors[role])])) as Record<ColorRole, string>),
    ...(Object.fromEntries(SURFACES.map((key) => [key, theme.surfaces[key] ?? DARK_SURFACES[key]])) as Record<SurfaceKey, string>),
    ...theme.variation,
    spectralMode: spectral.mode,
    spectralStrength: spectral.strength,
    ...(Object.fromEntries(SPECTRAL_BANDS.map((band) => [`spectral_${band}`, hexOf(spectral.colors[band])])) as Record<`spectral_${SpectralBand}`, string>),
  };
}

/** The document the panel describes. Role tones go through `editRole` so its one rule — green signal — holds here too. */
function assemble(args: ThemeArgs): Theme {
  const base = PRESETS.find((one) => one.name === args.preset)?.theme ?? DEFAULT_THEME;
  const spectralBase = SPECTRAL_PRESETS.find((one) => one.name === args.spectralPreset)?.style ?? DEFAULT_SPECTRAL;
  let theme: Theme = {
    ...base,
    surfaces: Object.fromEntries(SURFACES.map((key) => [key, args[key]])) as Theme['surfaces'],
    variation: { warmth: args.warmth, saturation: args.saturation, lightness: args.lightness, strength: args.strength },
    spectral: {
      ...spectralBase,
      mode: args.spectralMode,
      strength: args.spectralStrength,
      colors: Object.fromEntries(SPECTRAL_BANDS.map((band) => [band, toneOf(args[`spectral_${band}`])])) as Record<SpectralBand, Tone>,
    },
  };
  for (const role of ROLES) {
    const tone = toneOf(args[role]);
    for (const key of ['h', 's', 'l'] as const) theme = editRole(theme, role, key, tone[key]);
  }
  return theme;
}

const invent = (columns: number, seed: number): Peak[] => {
  let n = seed;
  const random = () => (n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: columns }, (_, i) => {
    const body = 0.35 + 0.4 * Math.sin((i / columns) * Math.PI * 2);
    const hit = Math.pow(1 - ((i % 200) / 200), 3);
    const value = Math.min(1, (body + hit * 0.8) * (0.7 + random() * 0.3));
    return { min: -value * 0.9, max: value };
  });
};
const STEMS = ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano'] as const;
const PACKED = STEMS.map((_, i) => packedOf(invent(12000, 7 + i * 31)));
const DECKS = ['a', 'b', 'c', 'd'] as const;

/** Everything the theme colours, at once. */
function Sample({ theme }: { theme: Theme }) {
  const warnings = conflicts(theme);
  return (
    <div className="theme-sample">
      <section>
        <Label heading>Controls</Label>
        <Row>
          <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} />}</Held>
          <Held param={PAN}>{(v, set) => <Knob param={PAN} value={v} onChange={set} />}</Held>
          <Held param={GAIN}>{(v, set) => <Slider param={GAIN} value={v} onChange={set} />}</Held>
          <Held param={TIME}>{(v, set) => <NumberField param={TIME} value={v} onChange={set} />}</Held>
          <Held param={FILTER}>
            {(v, set) => <Segmented items={FILTER.items ?? []} index={Math.round(v)} onChange={set} name="Filter" />}
          </Held>
          <Held param={SHAPE}>
            {(v, set) => <Select items={SHAPE.items ?? []} index={Math.round(v)} onChange={set} name="Shape" />}
          </Held>
          <Meter value={0.62} peak={0.8} orientation="vertical" length={60} name="Out" />
          <Meter value={0.4} peak={0.9} orientation="horizontal" length={80} name="In" />
          <Held param={DRY_WET}>{(v, set) => <Toggle on={v > 50} onChange={(on) => set(on ? 100 : 0)} name="Active">On</Toggle>}</Held>
          <Toggle on={false} onChange={() => {}} name="Idle">Off</Toggle>
          <Button onPress={() => {}}>Plain</Button>
          <Button tone="quiet" onPress={() => {}}>Quiet</Button>
          <Button tone="danger" onPress={() => {}}>Delete</Button>
          <Button disabled onPress={() => {}}>Disabled</Button>
          <Knob param={FREQ} value={440} onChange={() => {}} disabled />
        </Row>
        <div className="loose">
          <Held param={DRY_WET}>
            {(x, setX) => (
              <Held param={PAN}>
                {(y, setY) => <XYPad x={{ param: DRY_WET, value: x, onChange: setX }} y={{ param: PAN, value: y, onChange: setY }} />}
              </Held>
            )}
          </Held>
        </div>
      </section>
      <section>
        <Label heading>Chain</Label>
        <Run />
      </section>
      <section>
        <Label heading>Stems</Label>
        {STEMS.map((stem, i) => (
          <Waveform key={stem} peaks={PACKED[i]} ink={`var(--stem-${stem})`} height={32} label={ROLE_NAMES[stem]} />
        ))}
      </section>
      <section>
        <Label heading>Decks and bands</Label>
        <div className="theme-sample-decks">
          {DECKS.map((deck) => (
            <span key={deck} style={{ color: `var(--deck-${deck})` }}>{deck.toUpperCase()}</span>
          ))}
          {DECKS.map((deck) => (
            <span key={`${deck}-wave`} className="theme-swatch" style={{ background: `var(--deck-${deck}-waveform)` }} />
          ))}
          {SPECTRAL_BANDS.map((band) => (
            <span key={band} className="theme-swatch" style={{ background: `var(--spectral-${band})` }} title={SPECTRAL_NAMES[band]} />
          ))}
        </div>
      </section>
      {warnings.length > 0 && <p role="status" className="theme-warning">{warnings.join(' ')}</p>}
      <details className="theme-document">
        <summary>Theme document</summary>
        <pre>{JSON.stringify(theme, null, 2)}</pre>
      </details>
    </div>
  );
}

const meta: Meta<ThemeArgs> = {
  title: 'Theme/Editor',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The theme document as controls: a colour per role and surface, a range per deck offset, the spectral style, and a preset that restores all of them. The sample under it is everything the theme colours. The toolbar Theme picker wraps this story like any other; the document’s own root sits inside it and wins.',
      },
    },
  },
  args: { preset: PRESETS[0].name, spectralPreset: SPECTRAL_PRESETS[0].name, ...flatten(DEFAULT_THEME) },
  argTypes: {
    preset: { control: 'select', options: PRESETS.map((one) => one.name), table: { category: 'Preset' } },
    ...Object.fromEntries(ROLES.map((role) => [role, { control: 'color', name: ROLE_NAMES[role], table: { category: 'Roles' } }])),
    ...Object.fromEntries(VARIATION.map(({ key, min, max }) => [key, { control: { type: 'range', min, max, step: 1 }, table: { category: 'Deck variation' } }])),
    spectralPreset: { control: 'select', options: SPECTRAL_PRESETS.map((one) => one.name), name: 'preset', table: { category: 'Spectral' } },
    spectralMode: { control: 'inline-radio', options: ['spectral', 'deck'], name: 'mode', table: { category: 'Spectral' } },
    spectralStrength: { control: { type: 'range', min: 0, max: 100, step: 1 }, name: 'strength', table: { category: 'Spectral' } },
    ...Object.fromEntries(SPECTRAL_BANDS.map((band) => [`spectral_${band}`, { control: 'color', name: SPECTRAL_NAMES[band], table: { category: 'Spectral' } }])),
    ...Object.fromEntries(SURFACES.map((key) => [key, { control: 'color', table: { category: 'Surfaces' } }])),
  },
  render: (typed) => {
    const [, update] = useArgs<ThemeArgs>();
    // A new preset resets the rest of the panel to it; a new spectral preset
    // resets its own category. Both start from the defaults the args are
    // flattened from, so a preset arriving in the URL resets the panel too.
    const lastPreset = useRef(PRESETS[0].name), lastSpectral = useRef(SPECTRAL_PRESETS[0].name);
    useEffect(() => {
      if (typed.preset === lastPreset.current) return;
      lastPreset.current = typed.preset;
      const picked = PRESETS.find((one) => one.name === typed.preset)?.theme ?? DEFAULT_THEME;
      const spectralName = SPECTRAL_PRESETS.find((one) => JSON.stringify(one.style) === JSON.stringify(picked.spectral))?.name ?? typed.spectralPreset;
      lastSpectral.current = spectralName;
      update({ ...flatten(picked), spectralPreset: spectralName });
    }, [typed.preset, typed.spectralPreset, update]);
    useEffect(() => {
      if (typed.spectralPreset === lastSpectral.current) return;
      lastSpectral.current = typed.spectralPreset;
      const style = SPECTRAL_PRESETS.find((one) => one.name === typed.spectralPreset)?.style ?? DEFAULT_SPECTRAL;
      update({
        spectralMode: style.mode,
        spectralStrength: style.strength,
        ...(Object.fromEntries(SPECTRAL_BANDS.map((band) => [`spectral_${band}`, hexOf(style.colors[band])])) as Record<`spectral_${SpectralBand}`, string>),
      });
    }, [typed.spectralPreset, update]);
    const theme = assemble(typed);
    return (
      <ThemeRoot theme={theme} className="theme-story">
        <Sample theme={theme} />
      </ThemeRoot>
    );
  },
};

export default meta;
type Story = StoryObj<ThemeArgs>;

export const Editor: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pick a preset, then move any colour or offset in the panel and watch the whole sample follow. The document under the sample is what you have made.',
      },
    },
  },
};
