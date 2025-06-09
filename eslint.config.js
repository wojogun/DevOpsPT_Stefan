import globals from 'globals';
import eslintPluginNode from 'eslint-plugin-n';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      node: eslintPluginNode,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
    },
  },
  {
    files: ['test/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  }
];
