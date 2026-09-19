import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, Label } from './Label.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Chrome/Text',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj;

export const HeadingAndLabel: Story = {
  parameters: note('A section heading and a control label.'),
  render: () => (
    <div className="stack">
      <Label heading>Oscillator</Label>
      <Label>Coarse</Label>
    </div>
  ),
};

export const Rule: Story = {
  parameters: note('A rule between sections.'),
  render: () => (
    <div className="stack wide">
      <Label heading>Filter</Label>
      <Divider />
      <Label heading>Envelope</Label>
    </div>
  ),
};
