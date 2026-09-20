import type { Meta, StoryObj } from '@storybook/react-vite';
import { Legend, type LegendItem } from './Legend.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

const ITEMS: LegendItem[] = [
  { kind: 'line', ink: 'var(--wdg-fill)', label: 'beat' },
  { kind: 'tall', ink: 'var(--green)', label: 'downbeat' },
  { kind: 'dashed', ink: 'var(--wdg-caption)', label: 'placed between anchors' },
  { kind: 'swatch', ink: 'var(--blue)', label: 'loop' },
  { kind: 'dot', ink: 'var(--wdg-alarm)', label: 'a fill' },
  { kind: 'text', ink: 'var(--green)', label: 'ms after predicted', text: '+1.2' },
];

const meta = {
  title: 'Debug/Legend',
  component: Legend,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'What the marks on a drawing mean. Six kinds of mark, each in an ink the drawing also uses — usually a var(--…), so a legend follows the palette rather than restating it. It is the only widget here whose whole job is to be read beside something else.',
      },
    },
  },
  args: { items: ITEMS },
  argTypes: {
    items: { control: 'object', description: 'Each a kind of mark, an ink, a label, and for the text kind the text itself.' },
    className: { control: false },
  },
  render: (args) => (
    <Frame>
      <Legend {...args} />
    </Frame>
  ),
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Marks: Story = {
  name: 'Legend',
  parameters: note('All six kinds at once: line, tall, dashed, swatch, dot and text.'),
};
