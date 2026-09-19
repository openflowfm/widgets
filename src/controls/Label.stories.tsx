import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider, Label } from './Label.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Chrome/Text',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`live.comment`: the text that names a control, and the reason a faceplate reads as rows rather than as a scattering of knobs. It carries the type rhythm — family, size, tracking, case — so a device panel gets that from one place.',
      },
    },
  },
  args: { children: 'Oscillator', heading: true, hint: '' },
  argTypes: {
    children: { control: 'text' },
    heading: { control: 'boolean' },
    hint: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingAndLabel: Story = {
  parameters: note('A section heading and a control label.'),
  args: { children: 'Oscillator', heading: true },
  render: (args) => (
    <div className="stack">
      <Label {...args} />
      <Label hint={args.hint}>Coarse</Label>
    </div>
  ),
};

export const Rule: Story = {
  parameters: note('A rule between sections.'),
  args: { children: 'Filter', heading: true },
  render: (args) => (
    <div className="stack wide">
      <Label {...args} />
      <Divider />
      <Label heading={args.heading} hint={args.hint}>
        Envelope
      </Label>
    </div>
  ),
};
