export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow the scopes this monorepo uses
    'scope-enum': [
      1,
      'always',
      ['api', 'web', 'shared', 'config', 'deps', 'ci', 'docs', 'skills'],
    ],
  },
};
