import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider.tsx';
import { CROSSFADE, DRY_WET, GAIN, Held, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Slider',
  component: Slider,
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj;

export const Vertical: Story = {
  parameters: note('Vertical. The same hook as the knob, laid out straight.'),
  render: () => <Held param={GAIN}>{(v, set) => <Slider param={GAIN} value={v} onChange={set} />}</Held>,
};

export const Horizontal: Story = {
  parameters: note('Horizontal. The rarer choice — a value box usually reads better in a row.'),
  render: () => (
    <Held param={DRY_WET}>
      {(v, set) => <Slider param={DRY_WET} value={v} onChange={set} orientation="horizontal" length={120} />}
    </Held>
  ),
};

export const Crossfader: Story = {
  parameters: note("Bipolar and horizontal at once: Live's crossfader, and why the orientation is here."),
  render: () => (
    <Held param={CROSSFADE}>
      {(v, set) => <Slider param={CROSSFADE} value={v} onChange={set} orientation="horizontal" length={120} />}
    </Held>
  ),
};

export const HorizontalInline: Story = {
  parameters: note(
    'Orientation and layout are two questions. The track runs across; the caption and the reading sit beside it rather than above and below.',
    { wide: true },
  ),
  render: () => (
    <Held param={GAIN}>
      {(v, set) => (
        <Slider param={GAIN} value={v} onChange={set} orientation="horizontal" layout="inline" length={120} />
      )}
    </Held>
  ),
};
