import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Shared base ESLint flat config (TypeScript). `project` is the path to the
// consuming app's tsconfig.json for type-aware linting.
export function baseConfig(project = './tsconfig.json', tsconfigRootDir) {
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
      languageOptions: {
        parserOptions: {
          project,
          ...(tsconfigRootDir ? { tsconfigRootDir } : {}),
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
      },
    },
    {
      ignores: [
        'dist/**',
        'node_modules/**',
        'coverage/**',
        '.next/**',
        '**/generated/**',
        '**/*.mjs',
        '**/*.config.js',
        '**/*.config.ts',
      ],
    },
  );
}

export default baseConfig;
