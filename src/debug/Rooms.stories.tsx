import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Facts } from './Facts.tsx';
import { Rooms, type Room } from './Rooms.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

const panel = (name: string) => () => <Facts items={[{ name: 'mounted', value: name }]} />;
const ROOMS: Room<null>[] = [
  { id: 'a', title: 'First room', note: 'with a note under it', experiments: [
    { id: 'x', title: 'X', description: '', component: panel('a/x') },
    { id: 'y', title: 'Y', description: '', component: panel('a/y') },
  ] },
  { id: 'b', title: 'Second room', experiments: [
    { id: 'z', title: 'Z', description: '', component: panel('b/z') },
  ] },
];

const meta = {
  title: 'Debug/Rooms',
  component: Rooms,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The second axis of a workspace, for when one row of tabs stopped being a list: rooms down the side, that room’s tabs across the top. A room is a title and a set of experiments — no layout, no state — so regrouping is moving a line. A remembered tab from another room opens the room rather than emptying it.',
      },
    },
  },
  args: { rooms: ROOMS, context: null, room: 'a', tab: 'x', onRoom: fn(), onTab: fn() },
  argTypes: {
    room: { control: 'inline-radio', options: ROOMS.map((one) => one.id) },
    tab: { control: 'inline-radio', options: ROOMS.flatMap((one) => one.experiments.map((e) => e.id)) },
    rooms: { control: false },
    context: { control: false, description: 'Handed to every experiment as its `context` prop. Null here; an app hands in its engine.' },
    aside: { control: false },
  },
  render: function Live(args) {
    const [, update] = useArgs<{ room: string; tab: string }>();
    return (
      <Frame>
        <Rooms
          {...args}
          onRoom={(id) => {
            args.onRoom(id);
            update({ room: id });
          }}
          onTab={(id) => {
            args.onTab(id);
            update({ tab: id });
          }}
        />
      </Frame>
    );
  },
} satisfies Meta<typeof Rooms<null>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoRooms: Story = {
  name: 'Rooms',
  parameters: note('Two rooms, the first with a note under its title. Pick the tab from the other room in the panel and the room opens with it.'),
};
