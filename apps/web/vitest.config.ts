import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Component testing for the web app (Vitest + React Testing Library).
// Fast, in-process (jsdom) — runs in the normal verify gate alongside API tests.
// For full-browser end-to-end flows, see the Playwright setup in e2e/.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Component tests live next to components as *.test.tsx. Exclude e2e (those
    // run under Playwright, not Vitest) and build output.
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
