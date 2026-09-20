import type { Meta, StoryObj } from '@storybook/react-vite';
import { Harness } from './Harness.tsx';
import { DebugCase } from '../../stories/DebugCase.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

/**
 * Every debug widget at once, which is the point of the module and the thing
 * a page of parts stops showing. The parts are the other stories in this
 * group; this is what they are for.
 */
const meta = {
  title: 'Debug/Together',
  component: Harness,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'All of the debug widgets at once, around a made-up signal with no app behind it: a harness, its transport, a scope of three rows, two plots, a legend and a ledger of facts.',
      },
    },
  },
  args: { title: 'Together' },
  argTypes: { title: { control: false }, subject: { control: false }, status: { control: false }, children: { control: false }, className: { control: false } },
  render: () => (
    <Frame>
      <DebugCase />
    </Frame>
  ),
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Together: Story = {
  parameters: note('A made-up signal, beats every half second, a head on the wall clock. Click the time row to seek, drag it to pan, shift-drag for a loop, alt-drag or drag the head to scrub; scroll pans and shift-scroll zooms about the pointer. Everything is drawn in palette inks read off the page, so it follows the toolbar Theme picker.'),
};
