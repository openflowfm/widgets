import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import palette from '../src/palette.css?inline';
import './preview.css';

/**
 * The host-tokens switch, as a toolbar global.
 *
 * `src/tokens.css` defines every colour and type token as `var(--host-token,
 * fallback)`, so a widget picks up the app's palette when it is mounted in the
 * app and uses its own when it isn't. The switch adds and removes the app's
 * palette from the page so both halves of that chain can be seen: a widget that
 * looks right only with host tokens present will look wrong the first time it
 * is used anywhere else.
 *
 * The palette is imported as text and mounted in a `<style>` rather than as a
 * stylesheet, because a stylesheet Vite has injected cannot be taken out again.
 */
function HostTokens({ on }: { on: boolean }) {
  useEffect(() => {
    if (!on) return;
    const style = document.createElement('style');
    style.dataset.palette = '';
    style.textContent = palette;
    document.head.append(style);
    return () => style.remove();
  }, [on]);
  return null;
}

const preview: Preview = {
  globalTypes: {
    hosted: {
      description: "The app's palette, present or absent",
      toolbar: {
        title: 'Host tokens',
        icon: 'paintbrush',
        items: [
          { value: 'on', title: 'Host tokens: on' },
          { value: 'off', title: 'Host tokens: off' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { hosted: 'on' },
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Controls', 'Chrome', 'Graph', 'Drawing', 'Mixer', 'Debug', 'Param'],
      },
    },
  },
  decorators: [
    (Story, { globals, parameters }) => {
      const note = parameters.note as string | undefined;
      const wide = parameters.wide as boolean | undefined;
      return (
        <>
          <HostTokens on={globals.hosted !== 'off'} />
          {note === undefined ? (
            <Story />
          ) : (
            <div className={`case${wide ? ' wide' : ''}`}>
              <div className="case-stage">
                <Story />
              </div>
              <p className="case-note">{note}</p>
            </div>
          )}
        </>
      );
    },
  ],
};

export default preview;
