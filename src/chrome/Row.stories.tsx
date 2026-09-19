import type { Meta, StoryObj } from '@storybook/react-vite';
import { Row } from './Row.tsx';
import { Knob } from '../controls/Knob.tsx';
import { Slider } from '../controls/Slider.tsx';
import { DRY_WET, FREQ, GAIN, Held, note } from '../../stories/parts.tsx';
import { Mixed } from '../../stories/shells.tsx';

const meta = {
  title: 'Chrome/Row',
  component: Row,
  tags: ['autodocs'],
} satisfies Meta<typeof Row>;

export default meta;
type Story = StoryObj;

export const Loose: Story = {
  parameters: note('Left to themselves: four controls, four different heights, nothing on a line.', { wide: true }),
  render: () => <Mixed />,
};

export const Ruled: Story = {
  parameters: note(
    'The same four in a row. Captions at one height, readings at another, whatever is between them — the value box has no reading to place, so it sits in the control band.',
    { wide: true },
  ),
  render: () => <Mixed ruled />,
};

export const WithInline: Story = {
  parameters: note(
    'An inline widget in a row takes the whole height rather than one of the three bands, so it lines up with the stacked ones on the middle instead of arguing with them.',
    { wide: true },
  ),
  render: () => (
    <Row>
      <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} />}</Held>
      <Held param={GAIN}>
        {(v, set) => (
          <Slider param={GAIN} value={v} onChange={set} orientation="horizontal" layout="inline" length={100} />
        )}
      </Held>
      <Held param={DRY_WET}>{(v, set) => <Knob param={DRY_WET} value={v} onChange={set} layout="inline" />}</Held>
    </Row>
  ),
};
