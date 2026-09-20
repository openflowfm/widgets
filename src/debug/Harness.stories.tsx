import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../controls/Button.tsx';
import { Select } from '../controls/Select.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { Facts } from './Facts.tsx';
import { Group, Harness, Shelf, Status, Toolbar, type HarnessProps } from './Harness.tsx';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

/**
 * The frame, with nothing in it, so the frame is what you see. Everything
 * else in the Debug group is mounted inside one of these; `Together` at the
 * end of the group is the composition.
 */
type HarnessArgs = HarnessProps & { withSubject: boolean; statusTone: 'none' | 'good' | 'bad' | 'quiet' | 'normal'; withShelf: boolean };

function HarnessCase({ title, withSubject: subject, statusTone: status, withShelf: shelf }: HarnessArgs) {
  const [on, setOn] = useState(true);
  return (
    <Frame>
      <Harness
        title={title}
        subject={subject ? <Select label="Subject" items={['a made-up signal', 'another']} index={0} onChange={() => {}} width={150} /> : undefined}
        status={status === 'none' ? undefined : <Status tone={status}>{status === 'bad' ? 'two missing' : 'nothing wrong'}</Status>}
      >
        <Toolbar>
          <Group caption="Range">
            <Button onPress={() => {}}>Whole</Button>
            <Button onPress={() => {}}>+</Button>
            <Button onPress={() => {}}>−</Button>
          </Group>
          <Group caption="Show">
            <Toggle on={on} onChange={setOn} label="Show the beats">beats</Toggle>
          </Group>
          <Group caption="Verdict">
            <Status tone="bad">two missing</Status>
            <Status tone="quiet">and one for completeness</Status>
          </Group>
        </Toolbar>
        {shelf && (
          <Shelf>
            <Facts items={[{ name: 'what a shelf is for', value: 'anything under the toolbar' }]} />
          </Shelf>
        )}
      </Harness>
    </Frame>
  );
}

const meta = {
  title: 'Debug/Harness',
  component: Harness,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The frame a debugging page is built in: a head with a title, a subject and a status; a toolbar of captioned groups; a shelf for anything that sits under them. It holds no state and draws nothing.',
      },
    },
  },
  args: { title: 'Harness', withSubject: true, statusTone: 'good', withShelf: true },
  argTypes: {
    title: { control: 'text' },
    withSubject: { control: 'boolean', description: 'Story-only: whether a subject select sits in the head.' },
    statusTone: { control: 'inline-radio', options: ['none', 'normal', 'good', 'bad', 'quiet'], description: 'Story-only: the tone of the `Status` in the head, or none.' },
    withShelf: { control: 'boolean', description: 'Story-only: whether a `Shelf` sits under the toolbar.' },
    subject: { control: false },
    status: { control: false },
    children: { control: false },
    className: { control: false },
  },
  render: (args) => <HarnessCase {...args} />,
} satisfies Meta<HarnessArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Frame_: Story = {
  name: 'Harness',
  parameters: note('The head, a toolbar of three captioned groups and a shelf. `Status` is used twice: once in the head, and inside a toolbar group as a verdict.'),
};

export const Bare: Story = {
  parameters: note('A title and a toolbar, nothing else: no subject, no status, no shelf.'),
  args: { withSubject: false, statusTone: 'none', withShelf: false },
};
