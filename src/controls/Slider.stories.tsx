import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import type { Param } from '../param/param.ts';
import { Slider } from './Slider.tsx';
import {
  CROSSFADE,
  DRY_WET,
  FREQ,
  GAIN,
  NOTE,
  PAN,
  STEPPED,
  TIME,
  VOICES,
  note,
} from '../../stories/parts.tsx';

/** The parameters the Controls panel can swap this slider onto. */
const PARAMS = { DRY_WET, PAN, FREQ, VOICES, TIME, GAIN, NOTE, CROSSFADE, STEPPED };

/** The panel holds a parameter's *name*; `mapping` turns it back into the parameter. */
const param = (key: keyof typeof PARAMS) => key as unknown as Param;

/**
 * One render for the file: the drag writes back into the args, so the widget
 * follows the panel and the panel follows the widget. `useArgs` belongs to the
 * story function itself, which is why this is called rather than mounted.
 */
const live = (args: ComponentProps<typeof Slider>) => {
  const [, updateArgs] = useArgs();
  return (
    <Slider
      {...args}
      onChange={(value) => {
        args.onChange(value);
        updateArgs({ value });
      }}
      onDepth={(depth) => {
        args.onDepth?.(depth);
        updateArgs({ depth });
      }}
    />
  );
};

const meta = {
  title: 'Controls/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`live.slider`: the same gesture as the knob, laid out straight. `orientation` is which way the track runs, `layout` is where the caption and the reading sit — two questions, not one.',
      },
    },
  },
  args: {
    param: param('GAIN'),
    value: 0,
    onChange: fn(),
    orientation: 'vertical',
    layout: 'stacked',
    side: 'left',
    fill: true,
    showValue: true,
    disabled: false,
    length: 27,
    onDepth: fn(),
    name: 'Gain',
    label: 'Gain',
  },
  argTypes: {
    param: { control: 'select', options: Object.keys(PARAMS), mapping: PARAMS },
    value: { control: { type: 'number' } },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    layout: { control: 'radio', options: ['stacked', 'inline', 'inside'] },
    side: { control: 'radio', options: ['left', 'right'] },
    origin: { control: 'radio', options: ['min', 'center'], description: 'Left unset, read off the range: a bipolar parameter fills from the middle.' },
    fill: { control: 'boolean' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
    length: { control: { type: 'range', min: 20, max: 240, step: 1 } },
    travel: { control: { type: 'range', min: 20, max: 600, step: 1 }, description: 'Pixels of drag across the whole range. Left unset, the length — or the hook’s 200 for an inside slider.' },
    live: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, description: 'Left unset, no wake is drawn.' },
    depth: { control: { type: 'range', min: -1, max: 1, step: 0.01 }, description: 'Left unset, no span is drawn. Shift-drag the slider to move it.' },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    ink: { control: 'color' },
    display: { control: false },
    onRelease: { control: false, table: { category: 'Events' } },
    onDepth: { control: false, table: { category: 'Events' } },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  parameters: note('Vertical. The same hook as the knob, laid out straight.'),
  args: { param: param('GAIN'), value: 0 },
};

export const Horizontal: Story = {
  parameters: note('Horizontal. The rarer choice — a value box usually reads better in a row.'),
  args: { param: param('DRY_WET'), value: 50, name: 'Dry/Wet', orientation: 'horizontal', length: 120, travel: 120 },
};

export const Crossfader: Story = {
  parameters: note("Bipolar and horizontal at once: Live's crossfader, and why the orientation is here."),
  args: {
    param: param('CROSSFADE'),
    value: 0,
    name: 'Crossfade',
    orientation: 'horizontal',
    length: 120,
    travel: 120,
  },
};

export const HorizontalInline: Story = {
  parameters: note(
    'Orientation and layout are two questions. The track runs across; the caption and the reading sit beside it rather than above and below.',
  ),
  args: {
    param: param('GAIN'),
    value: 0,
    orientation: 'horizontal',
    layout: 'inline',
    length: 120,
    travel: 120,
  },
};

export const Modulated: Story = {
  parameters: note('A wake behind the thumb, and a modulation span the caller can hand back: shift-drag moves the depth rather than the value.'),
  args: { param: param('GAIN'), value: -6, live: 0.6, depth: 0.4 },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { param: param('GAIN'), value: 0, disabled: true },
};
