import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chain } from './Chain.tsx';
import { Device } from './Device.tsx';
import { Row } from './Row.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { note } from '../../stories/parts.tsx';
import { Grouped, Run, Shell } from '../../stories/shells.tsx';

/** A one-switch faceplate, held here so the narrow cases have something real on them. */
function Switch() {
  const [on, setOn] = useState(false);
  return (
    <Toggle on={on} onChange={setOn} name="Active">
      {on ? 'On' : 'Off'}
    </Toggle>
  );
}

const meta = {
  title: 'Chrome/Chain',
  component: Chain,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The run a device sits in — Live\'s device view, and the chain inside a rack. It takes children rather than devices, so the order is the host\'s; what the chain owns is the height, the placeholder and the drop mark.',
      },
    },
  },
  args: {
    placeholder: 'Drop an audio effect here',
    rows: 2,
    // Both of these mean *nothing set*, and neither has a number that would
    // stand for it: no drag is not a position, and a chain with no height
    // given is the height of whatever it is in.
    dropAt: undefined,
    height: undefined,
  },
  argTypes: {
    placeholder: { control: 'text' },
    rows: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    dropAt: {
      control: { type: 'number', min: 0, max: 8, step: 1 },
      description: 'Where a dragged device would land, counted between children. Empty for no drag.',
    },
    height: { control: { type: 'number', min: 40, max: 400, step: 4 } },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Chain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TheRun: Story = {
  parameters: note('The run itself. Click a title bar to move the selection; fold the first one back open.'),
  render: (args) => <Run {...args} />,
};

export const MidDrag: Story = {
  parameters: note('Mid-drag: the strip marks where a device would land. Whoever is dragging decides whether it may.'),
  args: { dropAt: 2 },
  render: (args) => <Run {...args} />,
};

export const Empty: Story = {
  parameters: note("Empty, which is most of what a new track's chain looks like."),
};

export const NarrowDevice: Story = {
  parameters: note(
    "A one-switch faceplate. In a chain a device is never narrower than it is tall, so it stops at square rather than collapsing to a sliver — Live's rule, and what keeps a run readable.",
  ),
  render: (args) => (
    <Chain {...args}>
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
  ),
  render: (args) => <Grouped {...args} />,
};
