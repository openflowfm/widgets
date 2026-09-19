import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { format } from './format.ts';
import type { Param, UnitStyle } from './param.ts';
import { Knob } from '../controls/Knob.tsx';
import { NumberField } from '../controls/NumberField.tsx';
import { Slider } from '../controls/Slider.tsx';
import { UNITS } from '../../stories/parts.tsx';

/**
 * The point of the whole harness: change the model, not the widget, and watch
 * every control that reads it change with it.
 */
function Model() {
  const [unit, setUnit] = useState<UnitStyle>('percent');
  const [exponent, setExponent] = useState(1);
  const [steps, setSteps] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
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

  const numeric = (
    label: string,
    held: number,
    set: (n: number) => void,
    step: number,
    low: number,
    high: number,
  ) => (
    <label className="model-field">
      <span>{label}</span>
      <input
        type="number"
        value={held}
        step={step}
        min={low}
        max={high}
        onChange={(e) => set(Number(e.currentTarget.value))}
      />
    </label>
  );

  return (
    <div className="model">
      <div className="model-inputs">
        <label className="model-field">
          <span>unit</span>
          <select value={unit} onChange={(e) => setUnit(e.currentTarget.value as UnitStyle)}>
            {UNITS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {numeric('min', min, setMin, 1, -100000, 100000)}
        {numeric('max', max, setMax, 1, -100000, 100000)}
        {numeric('exponent', exponent, setExponent, 0.5, 0.1, 8)}
        {numeric('steps', steps, setSteps, 1, 0, 64)}
      </div>
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
} satisfies Meta;

export default meta;
type Story = StoryObj;

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
