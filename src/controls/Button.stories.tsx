import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj;

export const Plain: Story = {
  parameters: note('An action, not a parameter. Nothing is left behind when you let go.'),
  render: () => <Button onPress={() => {}}>Add node</Button>,
};

export const Quiet: Story = {
  parameters: note('Quiet: furniture on a canvas, where a box on every control would read as a form.'),
  render: () => (
    <Button tone="quiet" onPress={() => {}} label="Unwire">
      ×
    </Button>
  ),
};

export const Danger: Story = {
  parameters: note('Danger. Ordinary until you are on it, then it says so.'),
  render: () => (
    <Button tone="danger" onPress={() => {}}>
      Delete
    </Button>
  ),
};

export const Disabled: Story = {
  parameters: note('Disabled, and with a caption so it lines up in a Row.'),
  render: () => (
    <Button name="Roll" disabled onPress={() => {}}>
      Roll
    </Button>
  ),
};
