import type { Preview } from '@storybook/react-vite';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { useLayoutEffect, type CSSProperties, type ReactNode } from 'react';
import { ThemeRoot } from '../src/theme/ThemeRoot.tsx';
import { PRESETS, type Theme } from '../src/theme/theme.ts';
import { resolveTheme } from '../src/theme/resolve.ts';
import { HOST_TOKENS } from '../stories/tokens.ts';
import './preview.css';

/**
 * Two toolbar globals, for the two things that can change what a widget looks
 * like from outside it.
 *
 * **Theme** is `@storybook/addon-themes`: its picker wraps the story in a
 * `ThemeRoot` carrying one of the presets from `src/theme/theme.ts`, so every
 * widget can be seen under every palette a host might set, and a story can pin
 * one with `parameters.theme`. *None* is the page's own palette, which is what
 * an unthemed app gets.
 *
 * **Host tokens** answers the other question: `src/tokens.css` defines every
 * colour and type token as `var(--host-token, fallback)`, so a widget picks up
 * the app's palette when it is mounted in the app and uses its own when it
 * isn't. *Off* sets every palette token to `initial` on a wrapper, which makes
 * each one guaranteed-invalid inside it and lets the fallbacks show. A widget
 * that looks right only with host tokens present will look wrong the first
 * time it is used anywhere else.
 */
const UNHOSTED = Object.fromEntries(HOST_TOKENS.map((name) => [name, 'initial'])) as CSSProperties;

function Hosted({ on, children }: { on: boolean; children: ReactNode }) {
  return on ? <>{children}</> : <div style={UNHOSTED}>{children}</div>;
}

/**
 * The addon hands the picked entry to the provider. `none` is the palette as
 * shipped — no theme at all, which is what an unthemed app gets. It is an empty
 * object rather than null because the addon's map wants one.
 *
 * A `ThemeRoot` on its own would theme only the story's subtree, and the page
 * around it — the body, the docs page's own tables, a portal a menu or a modal
 * opens into — would stay on the shipped palette. So the resolved tokens are
 * also set on the document element, where everything inherits them, and taken
 * off again when the theme changes or goes.
 */
const isTheme = (theme: object): theme is Theme => 'version' in theme;

function Themed({ theme, children }: { theme: Theme | Record<string, never>; children: ReactNode }) {
  const resolved = isTheme(theme) ? resolveTheme(theme) : null;
  useLayoutEffect(() => {
    if (!resolved) return;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(resolved.tokens)) root.style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(resolved.tokens)) root.style.removeProperty(name);
    };
  }, [resolved]);
  return isTheme(theme) ? <ThemeRoot theme={theme}>{children}</ThemeRoot> : <>{children}</>;
}

const THEMES: Record<string, Theme | Record<string, never>> = {
  none: {},
  ...Object.fromEntries(PRESETS.map((one) => [one.name, one.theme])),
};

const preview: Preview = {
  globalTypes: {
    hosted: {
      description: "The app's palette, present or absent",
      toolbar: {
        title: 'Host tokens',
        icon: 'contrast',
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
        order: ['Tokens', 'Theme', 'Controls', 'Chrome', 'Graph', 'Music', ['Transport', 'Meter', 'Waveform', 'Four-deck mixer'], 'Debug', ['Harness', 'Scope', 'Plot', 'Facts', 'Legend', 'Workspace', 'Rooms', 'Together'], 'Param'],
      },
    },
  },
  decorators: [
    (Story, { globals }) => (
      <Hosted on={globals.hosted !== 'off'}>
        <Story />
      </Hosted>
    ),
    withThemeFromJSXProvider({ themes: THEMES, defaultTheme: PRESETS[0].name, Provider: Themed }),
  ],
};

export default preview;
