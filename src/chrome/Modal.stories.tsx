import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal.tsx';
import { Button } from '../controls/Button.tsx';
import { note } from '../../stories/parts.tsx';

const meta = {
  title: 'Chrome/Modal',
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj;

/** Mounted while the question is being asked, and unmounted once it is answered. */
function Asking() {
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState('nothing yet');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button onPress={() => setAsking(true)}>Delete take</Button>
      <span className="case-note" style={{ margin: 0 }}>
        {answer}
      </span>
      {asking && (
        <Modal
          title="delete take"
          onClose={() => setAsking(false)}
          actions={
            <Button
              tone="danger"
              onPress={() => {
                setAnswer('deleted');
                setAsking(false);
              }}
            >
              Delete
            </Button>
          }
        >
          <p style={{ margin: 0, fontSize: 'var(--text-lead)', lineHeight: 1.7 }}>
            Take 4 is nine bars long and has never been played back. Deleting it removes the audio from the
            disk as well as the row from the list.
          </p>
        </Modal>
      )}
    </div>
  );
}

export const AskAQuestion: Story = {
  parameters: note(
    'Ask it, and it is over everything: a native dialog, so it sits in the top layer whatever it opened over, focus is trapped inside it and returns to the button afterwards, escape and the scrim both close it. The × is always there because those two ways out are invisible; the row along the bottom is only for what the modal is for, so there is no Cancel saying what the × already says.',
  ),
  render: () => <Asking />,
};
