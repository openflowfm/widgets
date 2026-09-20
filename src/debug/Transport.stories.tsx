import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Button } from '../controls/Button.tsx';
import { Transport } from './Transport.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Debug/Transport',
  component: Transport,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Play, stop, and where the head is: a play button, the head as bars and as a clock, and the output's latency when the engine reports one. It owns no playback — it says what is true and calls back when pressed, which is what keeps it usable in a harness with no engine behind it.",
      },
    },
  },
  args: { playing: false, onToggle: fn(), at: 12.3456, latency: 0.0116, disabled: false },
  argTypes: {
    playing: { control: 'boolean' },
    at: { control: { type: 'number', min: 0, step: 0.25 } },
    latency: { control: { type: 'range', min: 0, max: 0.2, step: 0.001 }, description: 'In seconds. 0 hides it, as when the engine reports none.' },
    disabled: { control: 'boolean', description: 'As when nothing is loaded.' },
    children: { control: false },
  },
  // A press writes back into the args, so the button is live; the two buttons
  // beside it are what a harness puts in the transport's children.
  render: function Live(args) {
    const [, update] = useArgs<{ playing: boolean; at: number }>();
    return (
      <Frame>
        <Transport
          {...args}
          latency={args.latency || undefined}
          onToggle={() => {
            args.onToggle();
            update({ playing: !args.playing });
          }}
        >
          <Button onPress={() => update({ at: args.at + 1 })}>+1s</Button>
          <Button onPress={() => update({ at: 0 })}>Top</Button>
        </Transport>
      </Frame>
    );
  },
} satisfies Meta<typeof Transport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stopped: Story = {
  name: 'Transport',
  parameters: note('Stopped at twelve seconds and a bit, with a latency reported. Press play and it stays down; the buttons beside it move the head.'),
};

export const Playing: Story = {
  parameters: note('The play button in its down state. Nothing moves, because nothing is playing: the head is a number handed in.'),
  args: { playing: true },
};

export const Disabled: Story = {
  parameters: note('What it looks like when nothing is loaded.'),
  args: { disabled: true, at: 0, latency: 0 },
};
