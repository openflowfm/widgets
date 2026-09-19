import type { Meta, StoryObj } from '@storybook/react-vite';
import { Knob } from './Knob.tsx';
import { DRY_WET, FREQ, Held, PAN, STEPPED, VOICES, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Knob',
  component: Knob,
  tags: ['autodocs'],
} satisfies Meta<typeof Knob>;

export default meta;
type Story = StoryObj;

export const Unipolar: Story = {
  parameters: note("Unipolar. The arc grows from the left, like Live's Dry/Wet."),
  render: () => <Held param={DRY_WET}>{(v, set) => <Knob param={DRY_WET} value={v} onChange={set} />}</Held>,
};

export const Bipolar: Story = {
  parameters: note('Bipolar. A range straddling zero fills from the middle by default.'),
  render: () => <Held param={PAN}>{(v, set) => <Knob param={PAN} value={v} onChange={set} />}</Held>,
};

export const Tapered: Story = {
  parameters: note('Exponent 3. Half a turn reaches 2.5 kHz, not 10 kHz.'),
  render: () => <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} />}</Held>,
};

export const Int: Story = {
  parameters: note('An int parameter. One arrow press is one voice.'),
  render: () => <Held param={VOICES}>{(v, set) => <Knob param={VOICES} value={v} onChange={set} />}</Held>,
};

export const Stepped: Story = {
  parameters: note("Four steps across the range — Max's own worked example."),
  render: () => <Held param={STEPPED}>{(v, set) => <Knob param={STEPPED} value={v} onChange={set} />}</Held>,
};

export const Disabled: Story = {
  parameters: note('Disabled, as when Live reports is_enabled = 0.'),
  render: () => (
    <Held param={DRY_WET}>{(v, set) => <Knob param={DRY_WET} value={v} onChange={set} disabled />}</Held>
  ),
};

export const Inline: Story = {
  parameters: note('Laid inline: caption, control and reading on one line, for an inspector rather than a faceplate.'),
  render: () => (
    <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} layout="inline" />}</Held>
  ),
};
