import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import type { Param } from '../param/param.ts';
import { Knob } from './Knob.tsx';
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

/** The parameters the Controls panel can swap this knob onto. */
const PARAMS = { DRY_WET, PAN, FREQ, VOICES, TIME, GAIN, NOTE, CROSSFADE, STEPPED };

/**
 * The panel holds a parameter's *name*; `mapping` turns it back into the
 * parameter on the way into the story.
 */
const param = (key: keyof typeof PARAMS) => key as unknown as Param;

/**
 * One render for the file: the drag writes back into the args, so the widget
 * follows the panel and the panel follows the widget. `useArgs` belongs to the
 * story function itself, which is why this is called rather than mounted.
 */
const live = (args: ComponentProps<typeof Knob>) => {
  const [, updateArgs] = useArgs();
  return (
    <Knob
      {...args}
      onChange={(value) => {
        args.onChange(value);
        updateArgs({ value });
      }}
    />
  );
};

const meta = {
  title: 'Controls/Knob',
  component: Knob,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`live.dial`, and the control most of an Ableton device is made of. Switch the parameter in the panel to see the same knob take a taper, a step count or a bipolar range.',
      },
    },
  },
  args: {
    param: param('DRY_WET'),
    value: 50,
    onChange: fn(),
    origin: 'min',
    layout: 'stacked',
    side: 'left',
    disabled: false,
    showValue: true,
    travel: 200,
    name: 'Dry/Wet',
    label: 'Dry/Wet',
    title: '',
    hint: '',
    ink: '',
  },
  argTypes: {
    param: { control: 'select', options: Object.keys(PARAMS), mapping: PARAMS },
    value: { control: { type: 'number' } },
    origin: { control: 'radio', options: ['min', 'center'] },
    layout: { control: 'radio', options: ['stacked', 'inline', 'inside'] },
    side: { control: 'radio', options: ['left', 'right'] },
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
    travel: { control: { type: 'range', min: 50, max: 600, step: 10 } },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    ink: { control: 'color' },
    display: { control: false },
    onRelease: { control: false },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unipolar: Story = {
  parameters: note("Unipolar. The arc grows from the left, like Live's Dry/Wet."),
  args: { param: param('DRY_WET'), value: 50 },
};

export const Bipolar: Story = {
  parameters: note('Bipolar. A range straddling zero fills from the middle by default.'),
  args: { param: param('PAN'), value: 0, name: 'Pan', origin: 'center' },
};

export const Tapered: Story = {
  parameters: note('Exponent 3. Half a turn reaches 2.5 kHz, not 10 kHz.'),
  args: { param: param('FREQ'), value: 440, name: 'Freq' },
};

export const Int: Story = {
  parameters: note('An int parameter. One arrow press is one voice.'),
  args: { param: param('VOICES'), value: 8, name: 'Voices' },
};

export const Stepped: Story = {
  parameters: note("Four steps across the range — Max's own worked example."),
  args: { param: param('STEPPED'), value: 0, name: 'Steps' },
};

export const Disabled: Story = {
  parameters: note('Disabled, as when Live reports is_enabled = 0.'),
  args: { param: param('DRY_WET'), value: 50, disabled: true },
};

export const Inline: Story = {
  parameters: note(
    'Laid inline: the caption over the reading, beside the control, for an inspector rather than a faceplate.',
  ),
  args: { param: param('FREQ'), value: 440, name: 'Freq', layout: 'inline' },
};

export const InlineRight: Story = {
  parameters: note('The same, with the text on the right of the control.'),
  args: { param: param('FREQ'), value: 440, name: 'Freq', layout: 'inline', side: 'right' },
};
