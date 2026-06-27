import { baseConfig } from '@repo/config/eslint/base';

export default [
  ...baseConfig('./tsconfig.json'),
  {
    // --- Kit pattern enforcement (API) ---
    rules: {
      // Pattern: use the NestJS structured Logger, not bare console.*.
      // (console.warn/error allowed for bootstrap/edge cases.)
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // main.ts bootstrap and standalone scripts (seed, migrations) may log to
    // console — they're CLI entry points, not app runtime code.
    files: ['src/main.ts', 'prisma/**/*.ts', 'scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
];
