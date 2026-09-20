import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_SPECTRAL } from '../theme/spectral.ts';
import { Waveform, type WaveformProps } from './Waveform.tsx';
import { note } from '../../stories/parts.tsx';
import { packedOf, type Peak } from './levels.ts';
import type { SpectralOutlineStyle } from './spectralOutline.ts';

/**
 * A stand-in for a separated stem, because the harness has no library.
 *
 * Shaped rather than random: bars with an attack and a decay, a quiet middle
 * eight and a silent run, so the cases show the things a waveform has to get
 * right — a transient that survives being summarised, and a silence that draws
 * as a line rather than as a hole.
 */
const invent = (columns: number, seed: number): Peak[] => {
  let n = seed;
  const random = () => ((n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const out: Peak[] = [];
  for (let i = 0; i < columns; i++) {
    const at = i / columns;
    // A silent run, so the least a shape may be is visible on the page.
    const quiet = at > 0.42 && at < 0.5 ? 0 : at > 0.6 && at < 0.72 ? 0.18 : 1;
    const beat = (i % Math.round(columns / 96)) / Math.round(columns / 96);
    const hit = Math.pow(1 - beat, 3);
    const body = (0.35 + 0.4 * Math.sin(at * Math.PI * 2)) * quiet;
    const value = Math.min(1, (body + hit * 0.8 * quiet) * (0.7 + random() * 0.3));
    out.push({ min: -value * (0.8 + random() * 0.2), max: value });
  }
  return out;
};

const STEMS = [
  { id: 'drums', ink: 'var(--stem-drums, #f0883a)', seed: 7 },
  { id: 'bass', ink: 'var(--stem-bass, #6d8bf5)', seed: 41 },
  { id: 'vocals', ink: 'var(--stem-vocals, #a068f0)', seed: 93 },
];

const PACKED = STEMS.map((s) => packedOf(invent(48000, s.seed)));

const SPECTRUM = Array.from({ length: PACKED[0].length / 2 }, (_, i) => {
  const amplitude = Math.max(Math.abs(PACKED[0][i * 2]), PACKED[0][i * 2 + 1]);
  return [
    amplitude,
    amplitude * (0.2 + 0.8 * Math.sin(i / 400) ** 2),
    amplitude * (0.1 + 0.5 * Math.cos(i / 100) ** 2),
  ] as const;
});

/**
 * The frequency presentation as a word, because a canvas style is not
 * something a control panel can be asked to type out.
 */
const PRESENTATIONS: Record<string, SpectralOutlineStyle | undefined> = {
  none: undefined,
  layers: { layout: 'layers', spectral: DEFAULT_SPECTRAL, weights: [1, 1, 1], edge: 0.35 },
  blend: { layout: 'blend', spectral: DEFAULT_SPECTRAL, weights: [1, 1, 1], edge: 0.35 },
};

type WaveArgs = WaveformProps & { layout: 'none' | 'layers' | 'blend'; frequency: boolean };

/** One lane, with the presentation picked by name and the spectrum switched on or off. */
function Lane({ layout, frequency, spectrum, ...args }: WaveArgs) {
  return <Waveform {...args} spectrum={frequency ? spectrum ?? SPECTRUM : undefined} presentation={PRESENTATIONS[layout]} />;
}

const meta = {
  title: 'Music/Waveform',
  component: Waveform,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A stem as one closed silhouette, off a ladder of halvings, at whatever detail the window has earned. The window, the detail, the height, the ink and the optional frequency presentation are all the caller\'s.',
      },
    },
  },
  args: {
    peaks: PACKED[0],
    ink: 'var(--stem-drums, #f0883a)',
    from: 0,
    to: 1,
    height: 78,
    layout: 'none',
    frequency: false,
    label: 'a lane',
    // Both mean *let the drawing decide*: the detail rides the window, and the
    // window is the whole of it unless a scrolling strip says otherwise.
    density: undefined,
    visibleShare: undefined,
  },
  argTypes: {
    from: { control: { type: 'range', min: 0, max: 1, step: 0.001 } },
    to: { control: { type: 'range', min: 0, max: 1, step: 0.001 } },
    height: { control: { type: 'range', min: 20, max: 200, step: 2 } },
    smooth: { control: { type: 'range', min: 0, max: 1, step: 0.05 }, description: 'Left unset, the theme’s treatment decides, or a polyline.' },
    headroom: { control: { type: 'range', min: 0.1, max: 1, step: 0.05 }, description: 'Left unset, the theme’s treatment decides, or 0.86.' },
    visibleShare: { control: { type: 'range', min: 0.05, max: 1, step: 0.05 } },
    density: {
      control: { type: 'number', min: 0.05, max: 4, step: 0.25 },
      description: 'Points per CSS pixel. Leave empty to let it ride the zoom, which is the point.',
    },
    ink: {
      control: 'select',
      options: STEMS.map((s) => s.ink),
    },
    layout: {
      control: 'inline-radio',
      options: ['none', 'layers', 'blend'],
      description: 'Story-only name for `presentation`: the optional frequency styles.',
    },
    label: { control: 'text' },
    frequency: { control: 'boolean', description: 'Story-only: hand the lane a made-up spectrum, so the theme’s spectral paint and the layouts have bands to draw.' },
    presentation: { control: false },
    peaks: { control: false },
    spectrum: { control: false },
    colors: { control: false },
    samples: { control: false },
    className: { control: false },
  },
  render: (args) => <Lane {...args} />,
} satisfies Meta<WaveArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeLanes: Story = {
  parameters: note(
    'One shape a lane, off a ladder of halvings. Detail rides the window unless it is pinned: across the whole thing a quarter of a point per pixel reads as the shape of an arrangement, and a bar reads as a bar. The silent run draws as a line, because a silhouette whose edges meet encloses nothing and would otherwise vanish.',
  ),
  render: ({ ink, ...args }) => (
    <div className="case-stack">
      {STEMS.map((stem, i) => (
        <Lane key={stem.id} {...args} peaks={PACKED[i]} ink={i === 0 ? ink : stem.ink} label={stem.id} />
      ))}
    </div>
  ),
};

export const Frequency: Story = {
  parameters: note(
    'Optional frequency presentation: layers and blended spectrum on the same production outline. Silent bands remain empty. The lanes above keep their default output.',
  ),
  args: {
    frequency: true,
    layout: 'layers',
    smooth: 0.35,
    height: 72,
    label: 'frequency',
  },
};

export const Short: Story = {
  parameters: note('Short, and with no window given: the whole thing at 44px.'),
  args: { from: undefined, to: undefined, height: 44, label: 'a short lane' },
};

export const Silence: Story = {
  parameters: note('Silence on its own. A pixel of line, on the middle, where it happened.'),
  args: {
    peaks: PACKED[1],
    from: 0.42,
    to: 0.5,
    ink: 'var(--stem-bass, #6d8bf5)',
    height: 44,
    label: 'a silent run',
  },
};
