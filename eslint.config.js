'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const jestPlugin = require('eslint-plugin-jest');
const testingLibrary = require('eslint-plugin-testing-library');
const globals = require('globals');
const confusingBrowserGlobals = require('confusing-browser-globals');

// This mirrors the rule set that used to come from `eslint-config-react-app`
// (extends: react-app, react-app/jest), hand-ported to flat config because
// that package only ships eslintrc-format configs and hard-pins an old
// @typescript-eslint@^5 internally -- which is both no longer the current
// major and (more importantly) incompatible with where TypeScript's own
// classic API is headed. The rules below are the same curated subset CRA
// used, not each plugin's own broader "recommended" preset -- several of
// those (react/prop-types, several jsx-a11y interaction rules) don't apply
// to this codebase's conventions and would add a pile of unrelated new
// findings that were never part of what this migration is trying to do.
module.exports = tseslint.config(
  {
    ignores: ['build/**'],
  },
  js.configs.recommended,
  // Deliberately not tseslint.configs.recommended: that bundle adds a
  // batch of typescript-eslint's own opinionated rules (no-explicit-any,
  // etc.) that were never part of what eslint-config-react-app enabled.
  // base + eslintRecommended is the parser setup plus "turn off core
  // rules TS already checks better" -- the same intent as CRA's own
  // per-file no-undef/no-dupe-class-members overrides below.
  tseslint.configs.base,
  tseslint.configs.eslintRecommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      // Hardcoded rather than 'detect': eslint-plugin-react's auto-detect
      // path calls context.getFilename(), an ESLint Context API removed
      // in newer ESLint versions.
      react: {
        version: '19',
      },
    },
    rules: {
      // https://eslint.org/docs/rules/
      'array-callback-return': 'warn',
      'default-case': ['warn', { commentPattern: '^no default$' }],
      'dot-location': ['warn', 'property'],
      eqeqeq: ['warn', 'smart'],
      'new-parens': 'warn',
      'no-array-constructor': 'warn',
      'no-caller': 'warn',
      'no-cond-assign': ['warn', 'except-parens'],
      'no-const-assign': 'warn',
      'no-control-regex': 'warn',
      'no-delete-var': 'warn',
      'no-dupe-args': 'warn',
      'no-dupe-class-members': 'warn',
      'no-dupe-keys': 'warn',
      'no-duplicate-case': 'warn',
      'no-empty-character-class': 'warn',
      'no-empty-pattern': 'warn',
      'no-eval': 'warn',
      'no-ex-assign': 'warn',
      'no-extend-native': 'warn',
      'no-extra-bind': 'warn',
      'no-extra-label': 'warn',
      'no-fallthrough': 'warn',
      'no-func-assign': 'warn',
      'no-implied-eval': 'warn',
      'no-invalid-regexp': 'warn',
      'no-iterator': 'warn',
      'no-label-var': 'warn',
      'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
      'no-lone-blocks': 'warn',
      'no-loop-func': 'warn',
      'no-mixed-operators': [
        'warn',
        {
          groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
          ],
          allowSamePrecedence: false,
        },
      ],
      'no-multi-str': 'warn',
      'no-global-assign': 'warn',
      'no-unsafe-negation': 'warn',
      'no-new-func': 'warn',
      'no-new-object': 'warn',
      'no-new-symbol': 'warn',
      'no-new-wrappers': 'warn',
      'no-obj-calls': 'warn',
      'no-octal': 'warn',
      'no-octal-escape': 'warn',
      'no-redeclare': 'warn',
      'no-regex-spaces': 'warn',
      'no-restricted-syntax': ['warn', 'WithStatement'],
      'no-script-url': 'warn',
      'no-self-assign': 'warn',
      'no-self-compare': 'warn',
      'no-sequences': 'warn',
      'no-shadow-restricted-names': 'warn',
      'no-sparse-arrays': 'warn',
      'no-template-curly-in-string': 'warn',
      'no-this-before-super': 'warn',
      'no-throw-literal': 'warn',
      'no-undef': 'error',
      'no-restricted-globals': ['error', ...confusingBrowserGlobals],
      'no-unreachable': 'warn',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-labels': 'warn',
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      'no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false,
        },
      ],
      'no-useless-computed-key': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-rename': [
        'warn',
        {
          ignoreDestructuring: false,
          ignoreImport: false,
          ignoreExport: false,
        },
      ],
      'no-with': 'warn',
      'no-whitespace-before-property': 'warn',
      'require-yield': 'warn',
      'rest-spread-spacing': ['warn', 'never'],
      strict: ['warn', 'never'],
      'unicode-bom': ['warn', 'never'],
      'use-isnan': 'warn',
      'valid-typeof': 'warn',
      'getter-return': 'warn',

      // https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules
      'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
      'react/jsx-no-comment-textnodes': 'warn',
      'react/jsx-no-duplicate-props': 'warn',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': [
        'warn',
        {
          allowAllCaps: true,
          ignore: [],
        },
      ],
      'react/no-danger-with-children': 'warn',
      'react/no-direct-mutation-state': 'warn',
      'react/no-is-mounted': 'warn',
      'react/no-typos': 'error',
      'react/require-render-return': 'error',
      'react/style-prop-object': 'warn',

      // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/main/docs/rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': [
        'warn',
        {
          aspects: ['noHref', 'invalidHref'],
        },
      ],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/iframe-has-title': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/no-distracting-elements': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/scope': 'warn',
    },
  },
  {
    // TypeScript-specific tuning, matching what eslint-config-react-app
    // applied only to .ts(x) files on top of its own recommended rules.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // These three are set again here (not just relying on
      // tseslint.configs.eslintRecommended above) because flat config
      // merges array entries in order regardless of `files` scoping --
      // the unscoped rules block above this one would otherwise win and
      // clobber them back on for .ts(x) files.
      'default-case': 'off',
      'no-dupe-class-members': 'off',
      'no-undef': 'off',
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'warn',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'warn',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false,
        },
      ],
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
    plugins: {
      jest: jestPlugin,
      'testing-library': testingLibrary,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // https://github.com/jest-community/eslint-plugin-jest
      'jest/no-conditional-expect': 'error',
      'jest/no-identical-title': 'error',
      'jest/no-interpolation-in-snapshots': 'error',
      'jest/no-jasmine-globals': 'error',
      'jest/no-mocks-import': 'error',
      'jest/valid-describe-callback': 'error',
      'jest/valid-expect': 'error',
      'jest/valid-expect-in-promise': 'error',
      'jest/valid-title': 'warn',

      // https://github.com/testing-library/eslint-plugin-testing-library
      // Rule names below match v7 (some were renamed to the plural form,
      // or merged/renamed, since the eslint-config-react-app version that
      // last pinned this plugin at v5).
      'testing-library/await-async-queries': 'error',
      'testing-library/await-async-utils': 'error',
      'testing-library/no-await-sync-queries': 'error',
      'testing-library/no-container': 'error',
      'testing-library/no-debugging-utils': 'error',
      'testing-library/no-dom-import': ['error', 'react'],
      'testing-library/no-node-access': 'error',
      'testing-library/no-promise-in-fire-event': 'error',
      'testing-library/no-render-in-lifecycle': 'error',
      'testing-library/no-unnecessary-act': 'error',
      'testing-library/no-wait-for-multiple-assertions': 'error',
      'testing-library/no-wait-for-side-effects': 'error',
      'testing-library/no-wait-for-snapshot': 'error',
      'testing-library/prefer-find-by': 'error',
      'testing-library/prefer-presence-queries': 'error',
      'testing-library/prefer-query-by-disappearance': 'error',
      'testing-library/prefer-screen-queries': 'error',
      'testing-library/render-result-naming-convention': 'error',
    },
  },
);
