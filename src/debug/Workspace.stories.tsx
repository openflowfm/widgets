import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Facts } from './Facts.tsx';
import { Workspace, type Experiment } from './Workspace.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

const panel = (name: string) => () => <Facts items={[{ name: 'mounted', value: name }]} />;
const EXPERIMENTS: Experiment<null>[] = [
  { id: 'one', title: 'One', description: 'The description sits under the tabs.', component: panel('one') },
  { id: 'two', title: 'Two', description: 'Each tab brings its own.', component: panel('two') },
  { id: 'three', title: 'Three', description: '', component: panel('three') },
];

const meta = {
  title: 'Debug/Workspace',
  component: Workspace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A row of tabs over one panel. Only the selected experiment is mounted, so an experiment that runs something expensive stops when you leave it — and Reset tab remounts it, which is the quickest way to start a measurement over. An experiment that throws is caught at its own boundary rather than taking the page with it.',
      },
    },
  },
  args: { experiments: EXPERIMENTS, context: null, selected: 'one', onSelect: fn() },
  argTypes: {
    selected: { control: 'inline-radio', options: EXPERIMENTS.map((one) => one.id) },
    experiments: { control: false },
    context: { control: false, description: 'Handed to every experiment as its `context` prop. Null here; an app hands in its engine.' },
  },
  render: function Live(args) {
    const [, update] = useArgs<{ selected: string }>();
    return (
      <Frame>
        <Workspace
          {...args}
          onSelect={(id) => {
            args.onSelect(id);
            update({ selected: id });
          }}
        />
      </Frame>
    );
  },
} satisfies Meta<typeof Workspace<null>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tabs: Story = {
  name: 'Workspace',
  parameters: note('Three experiments, each a `Facts` that says which one is mounted. Switch tabs and the other two are gone.'),
};
