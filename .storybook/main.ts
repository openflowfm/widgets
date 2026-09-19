import type { StorybookConfig } from '@storybook/react-vite';

// Storybook is the harness: every control in every state, with no app around
// it. Stories sit beside the widget they show (`src/**/*.stories.tsx`); the
// shared fixtures they run on — the made-up parameters, the graph instrument,
// the mixer preview — live in `stories/`. Nothing from either ships in the
// package, and nothing here knows Live exists.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
  core: { disableTelemetry: true },
  viteFinal: (config) => ({
    ...config,
    // Keep the cache local to this package, and apart from anything else that
    // might share an installation — two Vite servers on one cache dir each
    // decide the other's is stale and re-optimize on every start.
    cacheDir: 'node_modules/.vite/storybook',
  }),
};

export default config;
