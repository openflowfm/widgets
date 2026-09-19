import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chain } from './Chain.tsx';
import { Device } from './Device.tsx';
import { Row } from './Row.tsx';
import { Switch } from '../controls/Toggle.stories.tsx';
import { note } from '../../stories/parts.tsx';
import { Grouped, Run, Shell } from '../../stories/shells.tsx';

const meta = {
  title: 'Chrome/Chain',
  component: Chain,
  tags: ['autodocs'],
} satisfies Meta<typeof Chain>;

export default meta;
type Story = StoryObj;

export const TheRun: Story = {
  parameters: note('The run itself. Click a title bar to move the selection; fold the first one back open.', {
    wide: true,
  }),
  render: () => <Run />,
};

export const MidDrag: Story = {
  parameters: note(
    'Mid-drag: the strip marks where a device would land. Whoever is dragging decides whether it may.',
    { wide: true },
  ),
  render: () => <Run dropAt={2} />,
};

export const Empty: Story = {
  parameters: note("Empty, which is most of what a new track's chain looks like."),
  render: () => <Chain placeholder="Drop an audio effect here" />,
};

export const NarrowDevice: Story = {
  parameters: note(
    "A one-switch faceplate. In a chain a device is never narrower than it is tall, so it stops at square rather than collapsing to a sliver — Live's rule, and what keeps a run readable.",
    { wide: true },
  ),
  render: () => (
    <Chain>
      <Device name="Gate" on onToggle={() => {}}>
        <Row>
          <Switch />
        </Row>
      </Device>
      <Shell name="Auto Filter" />
    </Chain>
  ),
};

export const NarrowDeviceAlone: Story = {
  parameters: note(
    "The same device on its own. No chain, no floor — it's the width of its faceplate, which is what a node on a canvas will want.",
  ),
  render: () => (
    <Device name="Gate" on onToggle={() => {}}>
      <Row>
        <Switch />
      </Row>
    </Device>
  ),
};

export const WithRack: Story = {
  parameters: note(
    "A rack: bookends around the selected chain's devices, not a box holding them. Delay inside the rack is exactly as tall as Saturator beside it. Pick a chain to see its devices — Dry has none.",
    { wide: true },
  ),
  render: () => <Grouped />,
};
