import type { Meta, StoryObj } from '@storybook/react-vite';
import { Device } from './Device.tsx';
import { note } from '../../stories/parts.tsx';
import { Shell } from '../../stories/shells.tsx';

const meta = {
  title: 'Chrome/Device',
  component: Device,
  tags: ['autodocs'],
} satisfies Meta<typeof Device>;

export default meta;
type Story = StoryObj;

export const Open: Story = {
  parameters: note('The shell: activator, fold triangle, name, and a faceplate under it.'),
  render: () => <Shell />,
};

export const Deactivated: Story = {
  parameters: note('Deactivated. The faceplate dims; every control on it still works.'),
  render: () => <Shell active={false} />,
};

export const Folded: Story = {
  parameters: note('Folded, the way a long chain stays readable — name on end, body gone.'),
  render: () => <Shell collapsed />,
};

export const Selected: Story = {
  parameters: note('Selected, and with presets: the hot-swap button appears only if a host can serve it.'),
  render: () => <Shell selected swappable />,
};
