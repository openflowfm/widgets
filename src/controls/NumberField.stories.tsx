import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import type { Param } from '../param/param.ts';
import { NumberField } from './NumberField.tsx';
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

/** The parameters the Controls panel can swap this field onto. */
const PARAMS = { DRY_WET, PAN, FREQ, VOICES, TIME, GAIN, NOTE, CROSSFADE, STEPPED };

/** The panel holds a parameter's *name*; `mapping` turns it back into the parameter. */
const param = (key: keyof typeof PARAMS) => key as unknown as Param;

/**
 * One render for the file: the drag and the typed value write back into the
 * args. `useArgs` belongs to the story function itself, which is why this is
 * called rather than mounted.
 */
const live = (args: ComponentProps<typeof NumberField>) => {
  const [, updateArgs] = useArgs();
  return (
    <NumberField
      {...args}
      width={args.width || undefined}
      onChange={(value) => {
        args.onChange(value);
        updateArgs({ value });
      }}
    />
  );
};

const meta = {
  title: 'Controls/Number field',
  component: NumberField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`live.numbox`: drag it like a fader, or type into it. The bar behind the digits is the value, drawn the way Live draws its own value boxes.',
      },
    },
  },
  args: {
    param: param('TIME'),
    value: 250,
    onChange: fn(),
    onRelease: fn(),
    showFill: true,
    editable: true,
    disabled: false,
    width: 0,
    name: 'Time',
    label: 'Time',
  },
  argTypes: {
    param: { control: 'select', options: Object.keys(PARAMS), mapping: PARAMS },
    value: { control: { type: 'number' } },
    origin: { control: 'radio', options: ['min', 'center'], description: 'Left unset, read off the range: a bipolar parameter fills from the middle.' },
    showFill: { control: 'boolean' },
    editable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    width: {
      control: { type: 'range', min: 0, max: 160, step: 1 },
      description: '0 fits the content, as leaving it unset does.',
    },
    travel: { control: { type: 'range', min: 50, max: 600, step: 10 }, description: 'Pixels of drag across the whole range. Left unset, the hook’s 200.' },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    display: { control: false },
    onRelease: { control: false, table: { category: 'Events' } },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Time: Story = {
  parameters: note('Drag to change. Type a digit or press Enter to edit.'),
  args: { param: param('TIME'), value: 250 },
};

export const Decibels: Story = {
  parameters: note('Decibels keep their tenth.'),
  args: { param: param('GAIN'), value: 0, name: 'Gain' },
};

export const Pan: Story = {
  parameters: note('A pan collapsed to a value box. Zero is the middle, so the fill has two sides.'),
  args: { param: param('PAN'), value: 0, name: 'Pan', origin: 'center' },
};

export const MidiNote: Story = {
  parameters: note("A MIDI note, named as Live names it. No fill: a note isn't a proportion."),
  args: { param: param('NOTE'), value: 60, name: 'Root', showFill: false },
};

export const HostDisplay: Story = {
  parameters: note('Display text supplied by the host wins over ours.'),
  args: { param: param('GAIN'), value: 0, name: 'Gain' },
  render: (args) => live({ ...args, display: `${args.value.toFixed(0)} units` }),
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { param: param('TIME'), value: 250, disabled: true },
};
