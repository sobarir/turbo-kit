// Root ESLint config — used by lint-staged (which runs from the repo root) and
// for linting packages/* that don't have their own config. The apps (apps/api,
// apps/web) have their own eslint.config.mjs that this does not override.
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { baseConfig } from '@repo/config/eslint/base';

const __dirname = import.meta.dirname || dirname(fileURLToPath(import.meta.url));

export default [
  ...baseConfig('./tsconfig.json', __dirname),
  {
    // The apps lint themselves via their own configs; ignore them here so the
    // root config only governs packages/* and loose root files.
    ignores: ['apps/**', '**/dist/**', '**/.next/**', '**/generated/**'],
  },
];
