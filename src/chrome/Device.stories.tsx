import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Device, type DeviceProps } from './Device.tsx';
import { note } from '../../stories/parts.tsx';
import { Faceplate } from '../../stories/shells.tsx';

/**
 * The shell is its props, so the stories are its args.
 *
 * `hotSwap` is a story-only flag: the component takes a callback, and whether
 * the button is there at all is what a host is actually choosing.
 */
type DeviceArgs = DeviceProps & { hotSwap: boolean };

/**
 * `on`, `folded` and `selected` are controlled, so a press has to write the arg
 * back or the shell would look dead. One helper for all four stories.
 */
function Live({ hotSwap, onHotSwap, ...args }: DeviceArgs) {
  const [, update] = useArgs();
  return (
    <Device
      {...args}
      onToggle={(next) => {
        args.onToggle?.(next);
        update({ on: next });
      }}
      onFold={(next) => {
        args.onFold?.(next);
        update({ folded: next });
      }}
      onSelect={() => {
        args.onSelect?.();
        update({ selected: !args.selected });
      }}
      onHotSwap={hotSwap ? onHotSwap : undefined}
    />
  );
}

const meta = {
  title: 'Chrome/Device',
  component: Device,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Live's device shell: an activator, a fold triangle, a name, and a faceplate under it. It owns none of those states — the host does — so every one of them is an arg here.",
      },
    },
  },
  args: {
    name: 'Auto Filter',
    on: true,
    folded: false,
    selected: false,
    hotSwap: false,
    onToggle: fn(),
    onFold: fn(),
    onSelect: fn(),
    onHotSwap: fn(),
    title: '',
    children: <Faceplate />,
  },
  argTypes: {
    name: { control: 'text' },
    title: { control: 'text' },
    on: { control: 'boolean' },
    folded: { control: 'boolean' },
    selected: { control: 'boolean' },
    hotSwap: { control: 'boolean', description: 'Story-only: whether the host can serve presets.' },
    onHotSwap: { control: false },
    children: { control: false },
    className: { control: false },
    inlets: { control: false },
    outlets: { control: false },
    screen: { control: false },
    chooser: { control: false },
    portRows: { control: false },
    headerStart: { control: false },
    headerAfterName: { control: false },
    headerEnd: { control: false },
    vars: { control: false },
  },
  render: Live,
} satisfies Meta<DeviceArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: note('The shell: activator, fold triangle, name, and a faceplate under it.'),
};

export const Deactivated: Story = {
  parameters: note('Deactivated. The faceplate dims; every control on it still works.'),
  args: { on: false },
};

export const Folded: Story = {
  parameters: note('Folded, the way a long chain stays readable — name on end, body gone.'),
  args: { folded: true },
};

export const Selected: Story = {
  parameters: note('Selected, and with presets: the hot-swap button appears only if a host can serve it.'),
  args: { selected: true, hotSwap: true },
};
