import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Meter',
  component: Meter,
  tags: ['autodocs'],
  args: { value: 0.62 },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level: Story = {
  parameters: note('A level, read-only. Not a disabled slider — it never invited you.'),
  args: { value: 0.62, name: 'Out' },
};

export const WithPeak: Story = {
  parameters: note('With a hold, drawn as a line: where it is now, and how far it has been.'),
  args: { value: 0.45, peak: 0.83, name: 'Peak' },
};

export const Vertical: Story = {
  parameters: note("Vertical, which is the mixer's shape."),
  args: { value: 0.7, peak: 0.9, orientation: 'vertical', length: 60, name: 'L' },
};
