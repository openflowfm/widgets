import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { ThemeEditor } from './ThemeEditor.tsx';
import { ThemeRoot } from './ThemeRoot.tsx';
import { PRESETS, type Theme } from './theme.ts';
import { Knob } from '../controls/Knob.tsx';
import { Meter } from '../controls/Meter.tsx';
import { Slider } from '../controls/Slider.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { Button } from '../controls/Button.tsx';
import { Row } from '../chrome/Row.tsx';
import { Waveform } from '../wave/Waveform.tsx';
import { packedOf, type Peak } from '../wave/levels.ts';
import { DRY_WET, FREQ, GAIN } from '../../stories/parts.tsx';

/** A stand-in stem so the editor has waveforms to colour. */
const invent = (columns: number, seed: number): Peak[] => {
  let n = seed;
  const random = () => (n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: columns }, (_, i) => {
    const at = i / columns;
    const body = 0.35 + 0.4 * Math.sin(at * Math.PI * 2);
    const hit = Math.pow(1 - ((i % 200) / 200), 3);
    const value = Math.min(1, (body + hit * 0.8) * (0.7 + random() * 0.3));
    return { min: -value * 0.9, max: value };
  });
};
const STEMS = ['drums', 'bass', 'other', 'vocals'] as const;
const PACKED = STEMS.map((_, i) => packedOf(invent(12000, 7 + i * 31)));

/** What the theme lands on: the roles a device face, a meter and four stems read. */
function Sample() {
  return (
    <div className="theme-sample">
      <Row>
        <Knob param={FREQ} value={440} onChange={() => {}} />
        <Knob param={DRY_WET} value={50} onChange={() => {}} />
        <Slider param={GAIN} value={0} onChange={() => {}} />
        <Meter value={0.62} peak={0.8} orientation="vertical" length={60} name="Out" />
        <Toggle on onChange={() => {}} name="Active">
          On
        </Toggle>
        <Button onPress={() => {}}>Roll</Button>
        <Button tone="danger" onPress={() => {}}>
          Delete
        </Button>
      </Row>
      {STEMS.map((stem, i) => (
        <Waveform key={stem} peaks={PACKED[i]} ink={`var(--stem-${stem})`} height={40} label={stem} />
      ))}
      <div className="theme-sample-decks">
        {(['a', 'b', 'c', 'd'] as const).map((deck) => (
          <span key={deck} style={{ color: `var(--deck-${deck})` }}>
            {deck.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Theme/Editor',
  component: ThemeEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The controlled palette editor beside what it colours. The document it edits is the `theme` arg, so the panel shows the whole thing and a preset or a roll shows up there too. The toolbar Theme picker wraps this story like any other; the editor’s own root sits inside it and wins.',
      },
    },
  },
  // The panel holds a preset's name and `mapping` turns it into the document;
  // an edit writes the document itself back, which the select shows as no preset.
  args: { theme: PRESETS[0].name as unknown as Theme, onChange: fn() },
  argTypes: {
    theme: { control: 'select', options: PRESETS.map((one) => one.name), mapping: Object.fromEntries(PRESETS.map((one) => [one.name, one.theme])) },
  },
  render: (args) => {
    const [, update] = useArgs();
    const theme = args.theme as Theme;
    return (
      <ThemeRoot theme={theme} className="theme-editor-story">
        <ThemeEditor
          theme={theme}
          onChange={(next) => {
            args.onChange(next);
            update({ theme: next });
          }}
        />
        <Sample />
      </ThemeRoot>
    );
  },
} satisfies Meta<typeof ThemeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pick a role, drag its hue, saturation and lightness, or roll them; change the B/D variation and watch the deck letters move off A/C. Presets restore the whole document.',
      },
    },
  },
};
