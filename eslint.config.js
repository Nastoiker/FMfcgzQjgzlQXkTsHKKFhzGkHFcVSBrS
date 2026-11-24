import { readdirSync } from 'node:fs';
import ts from 'typescript-eslint';
import sort from 'eslint-plugin-simple-import-sort';
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const layerRules = layers.flatMap((layer, index) => {
  const slices = readdirSync(new URL('./apps/web/src/' + layer + '/', import.meta.url), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const higher = layers.slice(0, index).map((name) => '@/' + name + '/**');
  const publicOnly = layers
    .slice(index + 1)
    .filter((name) => name !== 'shared')
    .map((name) => '@/' + name + '/*/**');
  return slices.map((slice) => {
    const peers = ['app', 'shared'].includes(layer)
      ? []
      : slices
          .filter((other) => other !== slice)
          .flatMap((other) => ['@/' + layer + '/' + other, '@/' + layer + '/' + other + '/**']);
    return {
      files: ['apps/web/src/' + layer + '/' + slice + '/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          { patterns: ['./*', '../*', ...higher, ...peers, ...publicOnly] },
        ],
      },
    };
  });
});
export default ts.config(
  { files: ['e2e/**/*.js'], languageOptions: { globals: { document: 'readonly' } } },
  { ignores: ['**/dist/**', 'node_modules/**', 'test-results/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: Object.fromEntries(
        [
          'process',
          'console',
          'fetch',
          'global',
          'URL',
          'URLSearchParams',
          'Response',
          'setTimeout',
          'beforeAll',
          'afterAll',
          'test',
          'expect',
        ].map((name) => [name, 'readonly']),
      ),
    },
    rules: {
      'max-lines-per-function': ['error', { max: 40 }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
      'no-console': ['error', { allow: ['error'] }],
      'no-undef': 'error',
      'no-unused-vars': 'error',
      eqeqeq: 'error',
      'no-nested-ternary': 'error',
    },
  },
  {
    files: ['apps/**/*.ts', 'apps/**/*.tsx'],
    extends: ts.configs.strictTypeChecked,
    languageOptions: {
      parserOptions: { project: ['apps/api/tsconfig.json', 'apps/web/tsconfig.json'] },
    },
    plugins: { 'simple-import-sort': sort },
    rules: {
      'max-lines-per-function': ['error', { max: 40 }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
      'no-console': ['error', { allow: ['error'] }],
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      'simple-import-sort/imports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T'] },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression:not([returnType])',
          message: 'Укажите тип результата экспортируемой функции.',
        },
      ],
      'func-style': ['error', 'expression'],
      'arrow-body-style': ['error', 'as-needed'],
      'no-nested-ternary': 'error',
      eqeqeq: 'error',
      'no-restricted-imports': ['error', { patterns: ['./*', '../*'] }],
      'max-lines': ['error', { max: 110, skipBlankLines: true, skipComments: true }],
    },
  },
  ...layerRules,
);
