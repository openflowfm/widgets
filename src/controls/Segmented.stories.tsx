import type { Meta, StoryObj } from '@storybook/react-vite';
import { Segmented } from './Segmented.tsx';
import { FILTER, Held, SHAPE, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Segmented',
  component: Segmented,
  tags: ['autodocs'],
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj;

export const Horizontal: Story = {
  parameters: note("An enum with every member on screen, like Live's filter type."),
  render: () => (
    <Held param={FILTER}>
      {(v, set) => <Segmented items={FILTER.items ?? []} index={Math.round(v)} onChange={set} name="Filter" />}
    </Held>
  ),
};

export const Vertical: Story = {
  parameters: note('Vertical, for a narrow column.'),
  render: () => (
    <Held param={SHAPE}>
      {(v, set) => (
        <Segmented
          items={SHAPE.items ?? []}
          index={Math.round(v)}
          onChange={set}
          name="Shape"
          orientation="vertical"
        />
      )}
    </Held>
  ),
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  render: () => (
    <Held param={FILTER}>
      {(v, set) => <Segmented items={FILTER.items ?? []} index={Math.round(v)} onChange={set} disabled />}
    </Held>
  ),
};
