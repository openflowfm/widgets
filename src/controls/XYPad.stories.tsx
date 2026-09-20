import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType, ReactNode } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
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

type AxisName = keyof typeof AXES;
/** The panel holds each axis as a parameter's *name* and a value; the render assembles the `PadAxis`. */
type PadArgs = Omit<XYPadProps, 'x' | 'y'> & { xParam: AxisName; xValue: number; yParam: AxisName; yValue: number };

/**
 * One render for the file: each axis writes its own value back into the args,
 * so the plane is live and the panel follows the drag. `useArgs` belongs to the
 * story function itself, which is why this is called rather than mounted.
 */
const live = ({ xParam, xValue, yParam, yValue, ...args }: PadArgs, children?: ReactNode) => {
  const [, updateArgs] = useArgs();
  const onChange = fn();
  return (
    <XYPad
      {...args}
      x={{ param: AXES[xParam].param, value: xValue, onChange: (value) => { onChange(value); updateArgs({ xValue: value }); } }}
      y={{ param: AXES[yParam].param, value: yValue, onChange: (value) => { onChange(value); updateArgs({ yValue: value }); } }}
    >
      {children}
    </XYPad>
  );
};

/** An axis at its parameter's default, as a story's args hold it. */
const xAxis = (key: AxisName) => ({ xParam: key, xValue: AXES[key].param.defaultValue });
const yAxis = (key: AxisName) => ({ yParam: key, yValue: AXES[key].param.defaultValue });

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
  // The axes are assembled from name-and-value args, so the props table is the pad's without them.
  component: XYPad as unknown as ComponentType<PadArgs>,
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
    ...xAxis('FREQ'),
    ...yAxis('GAIN'),
    width: 120,
    height: 120,
    showValue: true,
    anchor: 'pointer',
    disabled: false,
    layout: 'stacked',
    side: 'left',
    name: '',
    label: 'Frequency and gain',
  },
  argTypes: {
    xParam: { control: 'select', options: Object.keys(AXES), name: 'x.param', description: 'Switching it leaves the value where it was.' },
    xValue: { control: { type: 'number' }, name: 'x.value' },
    yParam: { control: 'select', options: Object.keys(AXES), name: 'y.param', description: 'Switching it leaves the value where it was.' },
    yValue: { control: { type: 'number' }, name: 'y.value' },
    width: { control: { type: 'range', min: 60, max: 400, step: 2 }, description: 'In px.' },
    height: { control: { type: 'range', min: 60, max: 400, step: 2 }, description: 'In px.' },
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
} satisfies Meta<PadArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoParameters: Story = {
  parameters: note(
    "Two parameters on one pointer. Press anywhere and the handle comes to you, then stays with the pointer — a plane is the one control that doesn't grab where its value already is. The fine modifier and double-click to reset work as they do on a knob, and each axis takes the arrows on its own tab stop.",
  ),
  args: { ...xAxis('FREQ'), ...yAxis('GAIN'), label: 'Frequency and gain' },
};

export const OverArtwork: Story = {
  parameters: note(
    "Wider than it is tall, with artwork behind it — the slot a device's response curve goes in. The plane owns the geometry and the gesture and knows nothing about what's drawn under it.",
  ),
  args: {
    ...xAxis('FREQ'),
    ...yAxis('GAIN'),
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
  args: { ...xAxis('FREQ'), ...yAxis('PAN'), label: 'Frequency and pan' },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { ...xAxis('FREQ'), ...yAxis('GAIN'), label: 'Frequency and gain', disabled: true },
};
