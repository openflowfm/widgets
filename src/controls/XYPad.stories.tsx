import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { useArgs } from 'storybook/preview-api';
import { XYPad, type PadAxis, type XYPadProps } from './XYPad.tsx';
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

/** An axis, ready to hand to `x` or `y`: a parameter sitting at its default. */
const at = (p: PadAxis['param']): PadAxis => ({ param: p, value: p.defaultValue, onChange: () => {} });

/** The axes the Controls panel can swap either side of the plane onto. */
const AXES = {
  DRY_WET: at(DRY_WET),
  PAN: at(PAN),
  FREQ: at(FREQ),
  VOICES: at(VOICES),
  TIME: at(TIME),
  GAIN: at(GAIN),
  NOTE: at(NOTE),
  CROSSFADE: at(CROSSFADE),
  STEPPED: at(STEPPED),
};

/** The panel holds a parameter's *name*; `mapping` turns it back into the axis. */
const axis = (key: keyof typeof AXES) => key as unknown as PadAxis;

/**
 * One render for the file: each axis writes its own value back into the args,
 * so the plane is live and the panel follows the drag. `useArgs` belongs to the
 * story function itself, which is why this is called rather than mounted.
 */
const live = (args: XYPadProps, children?: ReactNode) => {
  const [, updateArgs] = useArgs();
  return (
    <XYPad
      {...args}
      x={{ ...args.x, onChange: (value) => updateArgs({ x: { ...args.x, value } }) }}
      y={{ ...args.y, onChange: (value) => updateArgs({ y: { ...args.y, value } }) }}
    >
      {children}
    </XYPad>
  );
};

/** Something for the plane to draw over, standing in for a device's own curve. */
function PadGrid() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {[25, 50, 75].map((line) => (
        <line key={`v${line}`} x1={line} y1="0" x2={line} y2="100" stroke="#2c2c31" strokeWidth="0.4" />
      ))}
      {[25, 50, 75].map((line) => (
        <line key={`h${line}`} x1="0" y1={line} x2="100" y2={line} stroke="#2c2c31" strokeWidth="0.4" />
      ))}
    </svg>
  );
}

const meta = {
  title: 'Controls/XY pad',
  component: XYPad,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A plane two parameters are dragged on at once — Live's X-Y control. One pointer, two gestures: it calls the same hook once per axis, so the fine modifier, the write rate and the reset are the ones every other control has. The artwork behind the handle is the caller's.",
      },
    },
  },
  args: {
    x: axis('FREQ'),
    y: axis('GAIN'),
    width: 120,
    height: 120,
    showValue: true,
    anchor: 'pointer',
    disabled: false,
    layout: 'stacked',
    side: 'left',
    name: '',
    label: 'Frequency and gain',
    title: '',
    hint: '',
    ink: '',
  },
  argTypes: {
    x: { control: 'select', options: Object.keys(AXES), mapping: AXES },
    y: { control: 'select', options: Object.keys(AXES), mapping: AXES },
    width: { control: { type: 'range', min: 60, max: 400, step: 2 } },
    height: { control: { type: 'range', min: 60, max: 400, step: 2 } },
    showValue: { control: 'boolean' },
    anchor: { control: 'radio', options: ['pointer', 'value'] },
    disabled: { control: 'boolean' },
    layout: { control: 'radio', options: ['stacked', 'inline', 'inside'] },
    side: { control: 'radio', options: ['left', 'right'] },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    ink: { control: 'color' },
    children: { control: false },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof XYPad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoParameters: Story = {
  parameters: note(
    "Two parameters on one pointer. Press anywhere and the handle comes to you, then stays with the pointer — a plane is the one control that doesn't grab where its value already is. The fine modifier and double-click to reset work as they do on a knob, and each axis takes the arrows on its own tab stop.",
  ),
  args: { x: axis('FREQ'), y: axis('GAIN'), label: 'Frequency and gain' },
};

export const OverArtwork: Story = {
  parameters: note(
    "Wider than it is tall, with artwork behind it — the slot a device's response curve goes in. The plane owns the geometry and the gesture and knows nothing about what's drawn under it.",
  ),
  args: {
    x: axis('FREQ'),
    y: axis('GAIN'),
    width: 260,
    height: 110,
    label: 'Frequency and gain over a grid',
  },
  render: (args) => live(args, <PadGrid />),
};

export const TaperedAxis: Story = {
  parameters: note(
    "A tapered axis reads as position: the frequency's exponent puts a third of the plane under the first 200 Hz, exactly as it puts a third of a knob's travel there.",
  ),
  args: { x: axis('FREQ'), y: axis('PAN'), label: 'Frequency and pan' },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { x: axis('FREQ'), y: axis('GAIN'), label: 'Frequency and gain', disabled: true },
};
