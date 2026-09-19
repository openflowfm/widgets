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
 */

function Preview() {
  const mixer = usePreviewMixer();
  const { colors, deckPairs } = useTheme();
  const theme = {
    primary: colors.primary, signal: colors.signal,
    stems: colors,
    decks: Object.fromEntries(mixer.state.decks.map((deck, i) => [deck.id, deckPairs[i]])),
  };
  return <MixerView {...mixer} theme={theme} />;
}
function PlayCase() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  return <ThemeRoot theme={theme}>
    <div className="play-theme-tools">
      <Toggle label="Show theme editor" on={open} onChange={setOpen} width={66}>Theme</Toggle>
      {open && <div className="play-theme-panel"><ThemeEditor theme={theme} onChange={setTheme} /></div>}
    </div>
    <Preview />
  </ThemeRoot>;
}
const meta = {
  title: 'Mixer/Four-deck mixer',
  component: MixerView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FourDecks: Story = {
  render: () => <PlayCase />,
  parameters: {
    docs: {
      description: {
        story:
          'Run starts the silent simulation; 1 bar queues changes, Now applies them immediately. Pause holds pending choices. Stop clears selections, queues, loops and position. Theme opens the shared editor, whose edits last as long as the story is mounted. No audio is produced.',
      },
    },
  },
};
