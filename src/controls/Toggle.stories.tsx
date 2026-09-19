import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Toggle } from './Toggle.tsx';
import { note } from '../../stories/parts.tsx';

/**
 * One render for the file: a press writes back into the args, so the switch is
 * live. `useArgs` belongs to the story function itself, which is why this is
 * called rather than mounted.
 */
const live = (args: ComponentProps<typeof Toggle>) => {
  const [, updateArgs] = useArgs();
  return (
    <Toggle
      {...args}
      width={args.width || undefined}
      onChange={(on) => {
        args.onChange(on);
        updateArgs({ on });
      }}
    >
      {args.children ?? (args.on ? 'On' : 'Off')}
    </Toggle>
  );
};

const meta = {
  title: 'Controls/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "`live.toggle`, and `live.button` when it doesn't stay down. A switch takes a boolean rather than a Param: nothing about drawing one needs a range, a taper or a unit.",
      },
    },
  },
  args: {
    on: false,
    onChange: fn(),
    momentary: false,
    disabled: false,
    layout: 'stacked',
    width: 0,
    name: 'Active',
    label: 'Active',
    title: '',
    hint: '',
    children: 'On',
    ink: '',
  },
  argTypes: {
    on: { control: 'boolean' },
    momentary: { control: 'boolean' },
    disabled: { control: 'boolean' },
    layout: { control: 'radio', options: ['stacked', 'inside'] },
    width: {
      control: { type: 'range', min: 0, max: 160, step: 1 },
      description: '0 fits the content, as leaving it unset does.',
    },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    children: { control: 'text' },
    ink: { control: 'color' },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Latching: Story = {
  parameters: note("A switch. Live's device activator is one of these."),
  args: { on: false },
};

export const Momentary: Story = {
  parameters: note('Momentary — springs back on release.'),
  args: { on: false, momentary: true },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { on: false, disabled: true },
};
