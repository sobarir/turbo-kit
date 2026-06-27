import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nextConfig } from '@repo/config/eslint/next';
import nextPlugin from '@next/eslint-plugin-next';

const __dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url));

export default [
  // E2E tests and Playwright config are linted/run by Playwright separately,
  // and are excluded from the app tsconfig — so keep them out of the app lint.
  { ignores: ['e2e/**', 'playwright.config.ts'] },
  ...nextConfig(nextPlugin, './tsconfig.json', __dirname),
];
