import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Modal, type ModalProps } from './Modal.tsx';
import { Button } from '../controls/Button.tsx';
import { note } from '../../stories/parts.tsx';

/**
 * A modal has no `open` prop — it is open by being mounted — so the story
 * carries the mounting as an arg, and names its action rather than passing a
 * node the control panel could not edit.
 */
type ModalArgs = Omit<ModalProps, 'actions'> & {
  open: boolean;
  actions: 'Delete' | 'Export' | 'none';
  body: string;
};

/** Mounted while the question is being asked, and unmounted once it is answered. */
function Asking({ open, actions, body, onClose, ...args }: ModalArgs) {
  const [, update] = useArgs();
  const shut = () => {
    onClose();
    update({ open: false });
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button onPress={() => update({ open: true })}>Delete take</Button>
      {open && (
        <Modal
          {...args}
          onClose={shut}
          actions={
            actions === 'none' ? undefined : (
              <Button tone={actions === 'Delete' ? 'danger' : undefined} onPress={shut}>
                {actions}
              </Button>
            )
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--text-lead)', lineHeight: 1.7 }}>{body}</p>
        </Modal>
      )}
    </div>
  );
}

const meta = {
  title: 'Chrome/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The one thing you are doing, over everything you were doing. It is a real `<dialog>`, so the top layer, the focus trap, the scrim and the escape key are the browser\'s; what a caller chooses is the title, the width and the row of actions.',
      },
    },
  },
  args: {
    open: false,
    title: 'delete take',
    actions: 'Delete',
    width: 420,
    label: 'delete take',
    body: 'Take 4 is nine bars long and has never been played back. Deleting it removes the audio from the disk as well as the row from the list.',
    onClose: fn(),
  },
  argTypes: {
    open: { control: 'boolean', description: 'Story-only: a modal is open by being mounted.' },
    title: { control: 'text' },
    actions: { control: 'radio', options: ['Delete', 'Export', 'none'] },
    width: { control: { type: 'range', min: 260, max: 720, step: 10 } },
    body: { control: 'text' },
    label: { control: 'text' },
    children: { control: false },
    className: { control: false },
  },
  render: Asking,
} satisfies Meta<ModalArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AskAQuestion: Story = {
  parameters: note(
    'Ask it, and it is over everything: a native dialog, so it sits in the top layer whatever it opened over, focus is trapped inside it and returns to the button afterwards, escape and the scrim both close it. The × is always there because those two ways out are invisible; the row along the bottom is only for what the modal is for, so there is no Cancel saying what the × already says.',
  ),
};
