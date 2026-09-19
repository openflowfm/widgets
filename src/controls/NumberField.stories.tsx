import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField } from './NumberField.tsx';
import { GAIN, Held, NOTE, PAN, TIME, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Number field',
  component: NumberField,
  tags: ['autodocs'],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj;

export const Time: Story = {
  parameters: note('Drag to change. Type a digit or press Enter to edit.'),
  render: () => <Held param={TIME}>{(v, set) => <NumberField param={TIME} value={v} onChange={set} />}</Held>,
};

export const Decibels: Story = {
  parameters: note('Decibels keep their tenth.'),
  render: () => <Held param={GAIN}>{(v, set) => <NumberField param={GAIN} value={v} onChange={set} />}</Held>,
};

export const Pan: Story = {
  parameters: note('A pan collapsed to a value box. Zero is the middle, so the fill has two sides.'),
  render: () => <Held param={PAN}>{(v, set) => <NumberField param={PAN} value={v} onChange={set} />}</Held>,
};

export const MidiNote: Story = {
  parameters: note("A MIDI note, named as Live names it. No fill: a note isn't a proportion."),
  render: () => (
    <Held param={NOTE}>{(v, set) => <NumberField param={NOTE} value={v} onChange={set} showFill={false} />}</Held>
  ),
};

export const HostDisplay: Story = {
  parameters: note('Display text supplied by the host wins over ours.'),
  render: () => (
    <Held param={GAIN}>
      {(v, set) => <NumberField param={GAIN} value={v} onChange={set} display={`${v.toFixed(0)} units`} />}
    </Held>
  ),
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  render: () => (
    <Held param={TIME}>{(v, set) => <NumberField param={TIME} value={v} onChange={set} disabled />}</Held>
  ),
};
