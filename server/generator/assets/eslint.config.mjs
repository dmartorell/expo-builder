import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from 'eslint-plugin-react';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginN from 'eslint-plugin-n';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [{
  ignores: ['**/node_modules/', '**/babel.config.js', '**/metro.config.js'],
}, ...compat.extends(
  'plugin:@typescript-eslint/recommended',
  'plugin:react/recommended',
  'semistandard',
), {
  plugins: {
    react,
    '@typescript-eslint': typescriptEslint,
    n: eslintPluginN,
  },
  languageOptions: {
    globals: {},
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-console': 'warn',
    '@typescript-eslint/no-var-requires': 0,
    'no-undef': 'off',
    'no-debugger': 'error',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

    'linebreak-style': ['error', 'unix'],
    'react/jsx-closing-bracket-location': [2, 'tag-aligned'],
    'react/jsx-max-props-per-line': [2, {
      maximum: 1,
      when: 'multiline',
    }],
    'react/jsx-indent-props': [2, 2],
    'max-params': ['error', 2],
    'react/prop-types': 0,
    indent: ['error', 2],
    'n/no-deprecated-api': 'error',
    'n/no-path-concat': 'error',
    'n/handle-callback-err': 'error',
    'n/no-exports-assign': 'error',
    'max-len': ['error', {
      code: 120,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreTrailingComments: true,
      ignoreUrls: true,
    }],
    'object-curly-spacing': ['error', 'always'],
    'import/newline-after-import': 'error',
    'import/order': ['error'],
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-expect-error': 'allow-with-description',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-warning-comments': ['warn', {
      terms: ['eslint', 'TODO', 'FIXME', ' ', '*'],
      location: 'anywhere',
    }],
  },
  ignores: [
    '**/node_modules/',
    '**/babel.config.js',
    '**/metro.config.js',
  ],
}];
