import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    coverage: { provider: 'v8', reportOnFailure: true, reporter: ['text', 'html', 'lcov'], include: ['src/**/*.{ts,tsx}'], exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'] },
  },
});
