import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MixerView } from './MixerView.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { ThemeRoot, useTheme } from '../theme/ThemeRoot.tsx';
import { ThemeEditor } from '../theme/ThemeEditor.tsx';
import { DEFAULT_THEME } from '../theme/theme.ts';
import { usePreviewMixer } from '../../stories/usePreviewMixer.ts';

/**
 * A complete composition: four decks, sixteen stems, driven by the preview
 * hook's silent simulation. The face receives state, commands, parameters and
 * resolved theme colours and decides nothing about playback itself.
 *
 * The state, commands and theme are the simulation's and are no use as
 * controls; `externalTransport` is the one thing an embedding host really
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

function PlayCase({ externalTransport }: { externalTransport: boolean }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  return <ThemeRoot theme={theme}>
    <div className="play-theme-tools">
      <Toggle label="Show theme editor" on={open} onChange={setOpen} width={66}>Theme</Toggle>
      {open && <div className="play-theme-panel"><ThemeEditor theme={theme} onChange={setTheme} /></div>}
    </div>
    <Preview externalTransport={externalTransport} />
  </ThemeRoot>;
}

const meta = {
  title: 'Mixer/Four-deck mixer',
  component: MixerView,
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
  render: ({ externalTransport }) => <PlayCase externalTransport={externalTransport} />,
  parameters: {
    docs: {
      description: {
        story:
          'Run starts the silent simulation; 1 bar queues changes, Now applies them immediately. Pause holds pending choices. Stop clears selections, queues, loops and position. Theme opens the shared editor, whose edits last as long as the story is mounted. No audio is produced.',
      },
    },
  },
};
