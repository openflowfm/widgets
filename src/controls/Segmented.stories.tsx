import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Segmented } from './Segmented.tsx';
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
 * One render for the file: a press writes the index back into the args.
 * `useArgs` belongs to the story function itself, so this is called rather
 * than mounted.
 */
const live = (args: ComponentProps<typeof Segmented>) => {
  const [, updateArgs] = useArgs();
  return (
    <Segmented
      {...args}
      onChange={(index) => {
        args.onChange(index);
        updateArgs({ index });
      }}
    />
  );
};

const meta = {
  title: 'Controls/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "`live.tab`: an enum with every member on screen at once, like Live's filter type. It is the one control where a Param is genuinely optional — it needs the members and the index, and an enum Param is only where those usually come from.",
      },
    },
  },
  args: {
    items: items('FILTER'),
    index: 0,
    onChange: fn(),
    orientation: 'horizontal',
    disabled: false,
    name: 'Filter',
    label: 'Filter',
  },
  argTypes: {
    items: { control: 'select', options: Object.keys(ITEMS), mapping: ITEMS },
    index: { control: { type: 'number', min: 0, step: 1 } },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    name: { control: 'text' },
    label: { control: 'text' },
    title: { control: 'text' },
    hint: { control: 'text' },
    className: { control: false },
  },
  render: (args) => live(args),
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  parameters: note("An enum with every member on screen, like Live's filter type."),
  args: { items: items('FILTER'), index: 0, name: 'Filter' },
};

export const Vertical: Story = {
  parameters: note('Vertical, for a narrow column.'),
  args: { items: items('SHAPE'), index: 0, name: 'Shape', orientation: 'vertical' },
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: { items: items('FILTER'), index: 0, name: 'Filter', disabled: true },
};
