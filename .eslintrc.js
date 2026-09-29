module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: null, // Each module should override with its own tsconfig
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['dist', 'node_modules', '.next', 'coverage'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['*.tsx', '*.jsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      env: {
        browser: true,
      },
    },
  ],
};
