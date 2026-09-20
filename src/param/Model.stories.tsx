import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { format } from './format.ts';
import type { Param, UnitStyle } from './param.ts';
import { Knob } from '../controls/Knob.tsx';
import { NumberField } from '../controls/NumberField.tsx';
import { Slider } from '../controls/Slider.tsx';
import { UNITS } from '../../stories/parts.tsx';

interface ModelArgs {
  unit: UnitStyle;
  min: number;
  max: number;
  exponent: number;
  /** Fewer than two is no stepping at all. */
  steps: number;
}

/**
 * The point of the whole harness: change the model, not the widget, and watch
 * every control that reads it change with it.
 *
 * The model is the args, so the panel that used to be hand-rolled above the
 * stage is Storybook's controls. What is left on the canvas is the three
 * widgets and what the parameter says about the value they share.
 */
function Model({ unit, min, max, exponent, steps }: ModelArgs) {
  const [value, setValue] = useState(50);

  const param: Param = {
    kind: 'float',
    min,
    max,
    defaultValue: (min + max) / 2,
    unit,
    customUnit: 'Bogons',
    exponent,
    steps: steps >= 2 ? steps : undefined,
    shortName: 'Model',
  };

  return (
    <div className="model">
      <div className="model-stage">
        <Knob param={param} value={value} onChange={setValue} />
        <Slider param={param} value={value} onChange={setValue} orientation="horizontal" length={140} />
        <NumberField param={param} value={value} onChange={setValue} width={72} />
      </div>
      <dl className="model-out">
        <dt>raw</dt>
        <dd>{value}</dd>
        <dt>format</dt>
        <dd>{format(param, value)}</dd>
      </dl>
    </div>
  );
}

const meta = {
  title: 'Param/Model playground',
  component: Model,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One parameter, three widgets, and the controls panel standing in for the host. Everything a `Param` carries — the unit style, the range, the taper and the step count — is an arg, and the knob, the slider and the number field all read the same one.',
      },
    },
  },
  args: { unit: 'percent', min: 0, max: 100, exponent: 1, steps: 0 },
  argTypes: {
    unit: { control: 'select', options: UNITS },
    min: { control: { type: 'number', step: 1 } },
    max: { control: { type: 'number', step: 1 } },
    exponent: { control: { type: 'range', min: 0.1, max: 8, step: 0.1 } },
    steps: { control: { type: 'range', min: 0, max: 64, step: 1 } },
  },
} satisfies Meta<typeof Model>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Change the unit style, range, exponent or step count and watch a knob, a slider and a number field all change together, with the raw value and the formatted string printed underneath. It is the fastest way to check a formatter, and it makes the model-first design visible — you are changing the parameter, not the widget.',
      },
    },
  },
};
