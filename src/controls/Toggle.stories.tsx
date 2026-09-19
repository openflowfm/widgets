import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toggle } from './Toggle.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj;

/** A toggle holding its own state, so a press does something. */
export function Switch({ momentary, disabled }: { momentary?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <Toggle on={on} onChange={setOn} momentary={momentary} disabled={disabled} name="Active">
      {on ? 'On' : 'Off'}
    </Toggle>
  );
}

export const Latching: Story = {
  parameters: note("A switch. Live's device activator is one of these."),
  render: () => <Switch />,
};

export const Momentary: Story = {
  parameters: note('Momentary — springs back on release.'),
  render: () => <Switch momentary />,
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  render: () => <Switch disabled />,
};
