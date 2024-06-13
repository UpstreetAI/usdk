import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import ts from 'typescript-eslint';


export default ts.config(
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 2022,

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        project: true,
        tsconfigRootDir: import.meta.dirname,
      },

      sourceType: 'module',

      globals: {
        ...globals['shared-node-browser'],
        ...globals.node,
      },
    },

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      '@stylistic/no-trailing-spaces': 'off',
      '@stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
          avoidEscape: true,
        }
      ],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-in-parens': 'error',
      'no-console': [ 1, { allow: [ 'error' ]}],
      'no-empty': [ 2, { allowEmptyCatch: true }],
      // 'no-use-before-define': [ 'off', { functions: false, classes: false }],
      'no-sequences': 'error',
      'sort-imports': 'error',
    }
  }
);
