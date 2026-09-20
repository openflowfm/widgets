import type { Meta, StoryObj } from '@storybook/react-vite';
import { MixerView } from './MixerView.tsx';
import { useTheme } from '../theme/ThemeRoot.tsx';
import { usePreviewMixer } from '../../stories/usePreviewMixer.ts';

/**
 * A complete composition: four decks, sixteen stems, driven by the preview
 * hook's silent simulation. The face receives state, commands, parameters and
 * resolved theme colours and decides nothing about playback itself.
 *
 * The state and commands are the simulation's and are no use as controls;
 * the theme is the toolbar's, read off the picker's `ThemeRoot` like any other
 * story; `externalTransport` is the one thing an embedding host really
 * chooses, so that is the arg.
 */

function Preview({ externalTransport }: { externalTransport: boolean }) {
  const mixer = usePreviewMixer();
  const { colors, deckPairs } = useTheme();
  const theme = {
    primary: colors.primary, signal: colors.signal,
    stems: colors,
    decks: Object.fromEntries(mixer.state.decks.map((deck, i) => [deck.id, deckPairs[i]])),
  };
  return <MixerView {...mixer} theme={theme} externalTransport={externalTransport} />;
}

const meta = {
  title: 'Mixer/Four-deck mixer',
  component: MixerView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The whole four-deck face on a silent simulation, so the composition can be worked on without an engine. Everything it shows is handed to it: state, semantic commands, parameter definitions, resolved theme colours and a read-only frame sampler.',
      },
    },
  },
  args: { externalTransport: false },
  argTypes: {
    externalTransport: {
      control: 'boolean',
      description: 'The host already displays its shared transport above the mixer.',
    },
    // The simulation's, and no use as controls: state and commands are the
    // preview hook's, the sampler is a function and the colours are the
    // theme's.
    state: { control: false },
    commands: { control: false },
    readFrame: { control: false },
    theme: { control: false },
    params: { control: false },
    deckProps: { control: false },
  },
} satisfies Meta<typeof MixerView>;

export default meta;

export const FourDecks: StoryObj<{ externalTransport: boolean }> = {
  render: ({ externalTransport }) => <Preview externalTransport={externalTransport} />,
  parameters: {
    docs: {
      description: {
        story:
          'Run starts the silent simulation; 1 bar queues changes, Now applies them immediately. Pause holds pending choices. Stop clears selections, queues, loops and position. The toolbar Theme picker colours it. No audio is produced.',
      },
    },
  },
};
