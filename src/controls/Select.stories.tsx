import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select.tsx';
import { FILTER, Held, LENS, ROUTE, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/Select',
  component: Select,
  tags: ['autodocs'],
  args: { items: FILTER.items ?? [], index: 0, onChange: () => {}, name: 'Filter' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  parameters: note(
    "A compact enum for a panel that cannot show every member at once. The menu is the widget's own, drawn in the top layer — so it is the same menu on every platform, it clears a node's transform and overflow, and it opens above a modal. Arrows pick straight away while it is shut; enter opens it, and then they move a highlight instead. Type the first letters of a member to jump to it, and press the same letter again to walk the ones that share it.",
  ),
  render: () => (
    <Held param={FILTER}>
      {(v, set) => <Select items={FILTER.items ?? []} index={Math.round(v)} onChange={set} name="Filter" />}
    </Held>
  ),
};

export const Long: Story = {
  parameters: note(
    'A list longer than the room under it: the menu scrolls, keeps the held member in view when it opens, and flips above the field when that is where the space is.',
  ),
  render: () => (
    <Held param={LENS}>
      {(v, set) => <Select items={LENS.items ?? []} index={Math.round(v)} onChange={set} name="Lens" />}
    </Held>
  ),
};

export const WideMembers: Story = {
  parameters: note(
    'Members longer than the field. The field clips to the width a panel was built around; the menu is free to be as wide as the words, up to a limit of its own.',
  ),
  render: () => (
    <Held param={ROUTE}>
      {(v, set) => (
        <Select items={ROUTE.items ?? []} index={Math.round(v)} onChange={set} name="Send to" width={92} />
      )}
    </Held>
  ),
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { items: FILTER.items ?? [], index: 0, onChange: () => {}, name: 'Filter', disabled: true },
};
