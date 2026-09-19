import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// Two projects. `unit` is the suites with an exact answer, under node. `stories`
// renders every story in headless Chromium and fails if one throws — the only
// test a widget's look gets, and the thing that used to be "open the bench and
// check". The addon reads `.storybook/` for the stories and the preview.
export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'unit', include: ['src/**/*.test.{ts,tsx}'], environment: 'node' },
      },
      {
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'stories',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: { provider: 'v8', reportOnFailure: true, reporter: ['text', 'html', 'lcov'], include: ['src/**/*.{ts,tsx}'], exclude: ['**/*.test.{ts,tsx}', '**/*.stories.tsx', '**/*.d.ts'] },
  },
});
