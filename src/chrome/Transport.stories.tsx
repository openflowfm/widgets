import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Transport, type TransportProps } from './Transport.tsx';
import { note } from '../../stories/parts.tsx';
import type { ComponentType } from 'react';
import type { Param } from '../param/param.ts';

const TEMPO: Param = { kind: 'float', min: 60, max: 200, defaultValue: 120, unit: 'custom', customUnit: '%0.1f' };

/**
 * The panel holds the optional parts as switches and the readings as numbers;
 * the render assembles the objects the component takes. A press writes back,
 * so play and loop are live.
 */
type TransportArgs = Pick<TransportProps, 'playing' | 'disabled' | 'fine' | 'latency' | 'playTitle' | 'stopTitle' | 'children' | 'className'> & {
  onPlay: TransportProps['onPlay'];
  onStop: NonNullable<TransportProps['onStop']>;
  withStop: boolean;
  withLoop: boolean;
  looping: boolean;
  loopingPart: boolean;
  tempo: 'none' | 'reading' | 'field';
  bpm: number;
  withNormalSpeed: boolean;
  seconds: number;
  withBeats: boolean;
  bar: number;
  bars: number;
};

const meta = {
  title: 'Chrome/Transport',
  component: Transport as unknown as ComponentType<TransportArgs>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Playback, the tempo it runs at, and where the head is — the group a header puts in the middle of the bar. No audio in it: the host hands it the facts and the commands. Everything past play is optional, so a harness gets two buttons and a clock and a DJ mixer gets the loop switch, the tempo field, the normal-speed button and the beat counter. The reading is a button: press it to switch between bar.beat.sixteenth and the clock.",
      },
    },
  },
  args: {
    playing: false,
    onPlay: fn(),
    onStop: fn(),
    disabled: false,
    withStop: true,
    withLoop: true,
    looping: false,
    loopingPart: false,
    tempo: 'field',
    bpm: 124,
    withNormalSpeed: false,
    seconds: 187.9,
    withBeats: true,
    bar: 2.3125,
    bars: 32,
    fine: false,
    latency: 0,
    playTitle: '',
    stopTitle: '',
  },
  argTypes: {
    playing: { control: 'boolean' },
    disabled: { control: 'boolean', description: 'Nothing to play.' },
    withStop: { control: 'boolean', description: 'Story-only: hand it `onStop`.', table: { category: 'Parts' } },
    withLoop: { control: 'boolean', description: 'Story-only: hand it a `loop`.', table: { category: 'Parts' } },
    looping: { control: 'boolean', table: { category: 'Parts' } },
    loopingPart: { control: 'boolean', description: 'A part rather than the whole: the accent colour.', table: { category: 'Parts' } },
    tempo: { control: 'inline-radio', options: ['none', 'reading', 'field'], description: 'Story-only: no tempo, a reading, or a field with `onChange`.', table: { category: 'Parts' } },
    bpm: { control: { type: 'range', min: 60, max: 200, step: 0.5 }, table: { category: 'Parts' } },
    withNormalSpeed: { control: 'boolean', description: 'Story-only: hand it `normalSpeed`.', table: { category: 'Parts' } },
    seconds: { control: { type: 'number', min: 0, step: 0.1 }, table: { category: 'Position' } },
    withBeats: { control: 'boolean', description: 'Story-only: hand the position a bar, so the reading can count beats.', table: { category: 'Position' } },
    bar: { control: { type: 'number', min: 0, step: 0.0625 }, table: { category: 'Position' } },
    bars: { control: { type: 'number', min: 1, step: 1 }, table: { category: 'Position' } },
    fine: { control: 'boolean', description: 'The clock to the millisecond.', table: { category: 'Position' } },
    latency: { control: { type: 'range', min: 0, max: 0.2, step: 0.001 }, description: 'In seconds. 0 leaves it out, as an engine that reports none does.' },
    playTitle: { control: 'text', description: 'Empty uses Play or Pause.' },
    stopTitle: { control: 'text' },
    onPlay: { control: false, table: { category: 'Events' } },
    onStop: { control: false, table: { category: 'Events' } },
    children: { control: false },
    className: { control: false },
  },
  render: function Live(args) {
    const [, update] = useArgs<TransportArgs>();
    return (
      <Transport
        playing={args.playing}
        onPlay={(next) => { args.onPlay(next); update({ playing: next }); }}
        onStop={args.withStop ? () => { args.onStop(); update({ playing: false, seconds: 0, bar: 0 }); } : undefined}
        disabled={args.disabled}
        playTitle={args.playTitle || undefined}
        stopTitle={args.stopTitle || undefined}
        loop={args.withLoop ? { on: args.looping, onChange: (on) => update({ looping: on }), partial: args.loopingPart, title: 'Loop the whole track' } : undefined}
        tempo={args.tempo === 'none' ? undefined : { param: TEMPO, value: args.bpm, display: args.bpm.toFixed(args.bpm % 1 ? 1 : 0), label: 'Tempo', onChange: args.tempo === 'field' ? (bpm) => update({ bpm }) : undefined }}
        normalSpeed={args.withNormalSpeed ? { onPress: () => update({ bpm: 124 }), disabled: args.bpm === 124, title: 'Back to the record’s own tempo' } : undefined}
        position={{ seconds: args.seconds, bar: args.withBeats ? args.bar : undefined, bars: args.bars }}
        fine={args.fine}
        latency={args.latency || undefined}
      />
    );
  },
} satisfies Meta<TransportArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  parameters: note("The full row, as mix[flow]'s header has it: play, stop, loop, an editable tempo and the beat counter. Press the counter for the clock."),
};

export const Playing: Story = {
  parameters: note('Playing: the play button turns to pause and takes the signal colour.'),
  args: { playing: true, looping: true, loopingPart: true },
};

export const Mixer: Story = {
  parameters: note('A DJ mixer with a local leader: the tempo is a reading rather than a field, with the normal-speed button beside it, and no loop switch since each deck has its own.'),
  args: { tempo: 'reading', withLoop: false, withNormalSpeed: true, bpm: 128 },
};

export const Harness: Story = {
  parameters: note('What the analysis harness needs and nothing more: play, stop, a clock to the millisecond, and the latency the engine reports.'),
  args: { withLoop: false, tempo: 'none', withBeats: false, fine: true, latency: 0.0116, seconds: 12.3456 },
};

export const Disabled: Story = {
  parameters: note('Nothing loaded.'),
  args: { disabled: true, seconds: 0, bar: 0 },
};
