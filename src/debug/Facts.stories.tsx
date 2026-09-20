import type { Meta, StoryObj } from '@storybook/react-vite';
import { Facts, type Fact } from './Facts.tsx';
import { Shelf } from './Harness.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

const ITEMS: Fact[] = [
  { name: 'tempo', value: '128.02 bpm' },
  { name: 'beats', value: 705 },
  { name: 'agreement', value: '93%', tone: 'good' },
  { name: 'missing', value: 2, tone: 'bad' },
  { name: 'latency', value: '11.6 ms', tone: 'quiet', title: 'What the output reported' },
  { name: 'arm', value: 'made up' },
];

const meta = {
  title: 'Debug/Facts',
  component: Facts,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Names and values, read at a glance — the ledger a harness opens with. A tone marks the one worth noticing: good, bad, or quiet for the ones that exist only for completeness. It is a description list, so it reads in order to a screen reader as it does on the page.',
      },
    },
  },
  args: { items: ITEMS },
  argTypes: {
    items: { control: 'object', description: 'Each a name, a value, an optional tone and an optional title for the hover.' },
    className: { control: false },
  },
  render: (args) => (
    <Frame>
      <Facts {...args} />
    </Frame>
  ),
} satisfies Meta<typeof Facts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ledger: Story = {
  name: 'Facts',
  parameters: note('Six facts in the four tones. Hover the latency for its title.'),
};

export const InShelf: Story = {
  parameters: note('The same widget under a toolbar, where a harness keeps its summary.'),
  args: { items: [{ name: 'in a shelf', value: 'the same widget, under a toolbar' }] },
  render: (args) => (
    <Frame>
      <Shelf>
        <Facts {...args} />
      </Shelf>
    </Frame>
  ),
};
