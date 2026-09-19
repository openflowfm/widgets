import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An action, not a parameter: a button reports that it happened and leaves nothing behind. The three tones are about how loudly it asks to be noticed, not about what it does.',
      },
    },
  },
  args: {
    children: 'Add node',
    onPress: fn(),
    tone: 'normal',
    disabled: false,
    width: 0,
    name: '',
    label: '',
    title: '',
    hint: '',
  },
  argTypes: {
    children: { control: 'text' },
    tone: { control: 'radio', options: ['normal', 'quiet', 'danger'] },
    disabled: { control: 'boolean' },
    width: {
      control: { type: 'range', min: 0, max: 240, step: 1 },
      description: '0 fits the content, as leaving it unset does.',
    },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    className: { control: false },
  },
  render: ({ width, ...args }) => <Button {...args} width={width || undefined} />,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  parameters: note('An action, not a parameter. Nothing is left behind when you let go.'),
  args: { children: 'Add node' },
};

export const Quiet: Story = {
  parameters: note('Quiet: furniture on a canvas, where a box on every control would read as a form.'),
  args: { children: '×', tone: 'quiet', label: 'Unwire' },
};

export const Danger: Story = {
  parameters: note('Danger. Ordinary until you are on it, then it says so.'),
  args: { children: 'Delete', tone: 'danger' },
};

export const Disabled: Story = {
  parameters: note('Disabled, and with a caption so it lines up in a Row.'),
  args: { children: 'Roll', name: 'Roll', disabled: true },
};
