import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// Three projects. `unit` is the suites with an exact answer, under node.
// `browser` is the `*.browser.test.tsx` suites, in Chromium and WebKit. `stories`
// renders every story in headless Chromium and fails if one throws — the only
// test a widget's look gets, and the thing that used to be "open the bench and
// check". The addon reads `.storybook/` for the stories and the preview.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      {
        // Suites that are claims about the engine, such as the graph's
        // coordinate maths under CSS `zoom`. WebKit too, because the main host
        // is the visuals app's WKWebView on macOS.
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
            // Room for a zoomed-in graph, so hit tests don't fall off the page.
            viewport: { width: 1024, height: 768 },
          },
        },
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
    // Istanbul rather than v8, because v8 coverage only works in Chromium and
    // the browser project runs in WebKit too.
    coverage: { provider: 'istanbul', reportOnFailure: true, reporter: ['text', 'html', 'lcov'], include: ['src/**/*.{ts,tsx}'], exclude: ['**/*.test.{ts,tsx}', '**/*.stories.tsx', '**/*.d.ts'] },
  },
});
