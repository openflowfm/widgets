import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Music/Meter',
  component: Meter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`live.meter~`: a level, read-only. Not a disabled slider — it never invited you, so there is no gesture and the role is `meter`. `peak` is a hold, drawn as a line rather than a second fill, because the two numbers answer different questions.',
      },
    },
  },
  args: {
    value: 0.62,
    peak: 0,
    orientation: 'horizontal',
    layout: 'stacked',
    side: 'left',
    showValue: false,
    width: 6,
    length: 48,
    name: '',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    peak: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    layout: { control: 'radio', options: ['stacked', 'inline', 'inside'] },
    side: { control: 'radio', options: ['left', 'right'] },
    showValue: { control: 'boolean' },
    width: { control: { type: 'range', min: 2, max: 24, step: 1 } },
    length: { control: { type: 'range', min: 20, max: 200, step: 1 } },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    ink: { control: 'color' },
    display: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level: Story = {
  parameters: note('A level, read-only. Not a disabled slider — it never invited you.'),
  args: { value: 0.62, name: 'Out' },
};

export const WithPeak: Story = {
  parameters: note('With a hold, drawn as a line: where it is now, and how far it has been.'),
  args: { value: 0.45, peak: 0.83, name: 'Peak' },
};

export const Vertical: Story = {
  parameters: note("Vertical, which is the mixer's shape."),
  args: { value: 0.7, peak: 0.9, orientation: 'vertical', length: 60, name: 'L' },
};
