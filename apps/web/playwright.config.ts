import { defineConfig, devices } from '@playwright/test';

// End-to-end browser tests (Playwright). These launch a REAL browser against the
// running app + API, so they catch integration bugs component tests can't
// (routing, the real API contract, auth redirects, full flows like checkout).
//
// Deliberately NOT part of the per-commit verify gate: E2E is slower and more
// environment-sensitive, so it runs as a separate CI job (see
// .github/workflows/e2e.yml) and locally via `bun run test:e2e`. Keeping it out
// of the fast gate avoids training people to ignore a flaky red.
export default defineConfig({
  testDir: './e2e',
  // Fail the build if someone leaves test.only in source.
  forbidOnly: !!process.env.CI,
  // Retry once in CI to absorb genuine flake; zero locally so flakes are visible.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry', // capture a trace when a test retries, for debugging
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Start the web app for local runs. In CI we start API+web explicitly (the app
  // needs the API + a database), so webServer is skipped there.
  webServer: process.env.CI
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
