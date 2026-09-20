import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Select } from './Select.tsx';
import { FILTER, LENS, ROUTE, SHAPE, note } from '../../stories/parts.tsx';

/** The enums the Controls panel can swap the members for, by parameter name. */
const ITEMS = {
  FILTER: FILTER.items ?? [],
  SHAPE: SHAPE.items ?? [],
  LENS: LENS.items ?? [],
  ROUTE: ROUTE.items ?? [],
};

/** The panel holds the enum's *name*; `mapping` turns it back into its members. */
const items = (key: keyof typeof ITEMS) => key as unknown as readonly string[];

/**
 * One render for the file: picking a member writes the index back into the
 * args. `useArgs` belongs to the story function itself, so this is called
 * rather than mounted.
 */
const live = (args: ComponentProps<typeof Select>) => {
  const [, updateArgs] = useArgs();
  return (
    <Select
      {...args}
      width={args.width || undefined}
      onChange={(index) => {
        args.onChange(index);
        updateArgs({ index });
      }}
    />
  );
};

const meta = {
  title: 'Controls/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A compact enum: one member on screen, with the rest in a menu of our own rather than the system's. The menu is drawn in the top layer, so it is the same menu on every platform, clears a node's transform and overflow, and opens above a modal.",
      },
    },
  },
  args: {
    items: items('FILTER'),
    index: 0,
    onChange: fn(),
    width: 0,
    disabled: false,
    name: 'Filter',
    label: 'Filter',
  },
  argTypes: {
    items: { control: 'select', options: Object.keys(ITEMS), mapping: ITEMS },
    index: { control: { type: 'number', min: 0, step: 1 } },
    width: {
      control: { type: 'range', min: 0, max: 240, step: 1 },
      description: '0 fits the content, as leaving it unset does.',
    },
    disabled: { control: 'boolean' },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  parameters: note(
    "A compact enum for a panel that cannot show every member at once. The menu is the widget's own, drawn in the top layer — so it is the same menu on every platform, it clears a node's transform and overflow, and it opens above a modal. Arrows pick straight away while it is shut; enter opens it, and then they move a highlight instead. Type the first letters of a member to jump to it, and press the same letter again to walk the ones that share it.",
  ),
  args: { items: items('FILTER'), index: 0, name: 'Filter' },
};

export const Long: Story = {
  parameters: note(
    'A list longer than the room under it: the menu scrolls, keeps the held member in view when it opens, and flips above the field when that is where the space is.',
  ),
  args: { items: items('LENS'), index: 6, name: 'Lens' },
};

export const WideMembers: Story = {
  parameters: note(
    'Members longer than the field. The field clips to the width a panel was built around; the menu is free to be as wide as the words, up to a limit of its own.',
  ),
  args: { items: items('ROUTE'), index: 1, name: 'Send to', width: 92 },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { items: items('FILTER'), index: 0, name: 'Filter', disabled: true },
};
