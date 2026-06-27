import { baseConfig } from './base.mjs';

// ESLint flat config for Next.js apps. Composes the shared TypeScript base and
// layers Next's recommended rules plus kit-specific pattern enforcement.
// Pass the Next plugin (resolved from the app) and the app's tsconfig path.
export function nextConfig(nextPlugin, project = './tsconfig.json', tsconfigRootDir) {
  return [
    ...baseConfig(project, tsconfigRootDir),
    {
      plugins: { '@next/next': nextPlugin },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
      },
    },
    {
      // --- Kit pattern enforcement (web) ---
      rules: {
        // Pattern: the frontend never calls fetch directly — always go through
        // the typed api client (src/lib/api.ts), which handles auth + token
        // refresh. api.ts itself is exempted below.
        'no-restricted-globals': [
          'error',
          {
            name: 'fetch',
            message:
              'Do not call fetch directly. Use the api client in src/lib/api.ts (it handles auth headers and token refresh).',
          },
        ],
        // Pattern: theme via tokens, never hardcoded colors. Bans Tailwind
        // arbitrary color classes like bg-[#1a73e8] / text-[rgb(...)] so the
        // one-file theming in theme.css stays authoritative.
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'Literal[value=/(bg|text|border|ring|from|to|via|fill|stroke)-\\[#|(bg|text|border|ring|from|to|via|fill|stroke)-\\[rgb/]',
            message:
              'No hardcoded color classes (e.g. bg-[#1a73e8]). Use semantic tokens (bg-primary, text-muted-foreground) defined in theme.css.',
          },
        ],
      },
    },
    {
      // The api client is the ONE place allowed to call fetch.
      files: ['src/lib/api.ts'],
      rules: { 'no-restricted-globals': 'off' },
    },
  ];
}

export default nextConfig;
