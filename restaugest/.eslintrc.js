module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/require-explicit-emits': 'warn',
    'vue/v-on-event-hyphenation': 'warn',
    'vue/attributes-order': ['warn', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        ['UNIQUE', 'SLOT'],
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ]
    }],
    'vue/component-tags-order': ['warn', {
      order: ['template', 'script', 'style']
    }],
    'vue/no-multiple-template-root': 'error',
    'vue/no-mutating-props': 'error',
    'vue/no-side-effects-in-computed-properties': 'error',
    'vue/return-in-computed-property': 'error',
    'vue/valid-template-root': 'error',
    'vue/valid-v-model': 'error',
    'vue/valid-v-on': 'error',
    'vue/valid-v-slot': 'error',
    'vue/valid-v-if': 'error',
    'vue/valid-v-for': 'error',
    'vue/valid-v-bind': 'error',
    'vue/no-template-key': 'error',
    'vue/no-unused-vars': 'warn',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/require-v-for-key': 'error',
    'vue/valid-v-show': 'error',
    'vue/comment-directive': 'warn',
    'vue/html-closing-bracket-newline': ['warn', {
      'singleline': 'never',
      'multiline': 'always'
    }],
    'vue/html-closing-bracket-spacing': ['warn', {
      'startTag': 'never',
      'endTag': 'never',
      'selfClosingTag': 'always'
    }],
    'vue/html-indent': ['warn', 2],
    'vue/html-quotes': ['warn', 'double'],
    'vue/html-self-closing': ['warn', {
      'html': {
        'void': 'never',
        'normal': 'always',
        'component': 'always'
      }
    }],
    'vue/max-attributes-per-line': ['warn', {
      'singleline': 3,
      'multiline': 1
    }],
    'vue/no-spaces-around-equal-signs-in-attribute': 'warn',
    'vue/prop-name-casing': ['warn', 'camelCase'],
    'vue/v-bind-style': ['warn', 'shorthand'],
    'vue/v-on-style': ['warn', 'shorthand'],
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'semi': ['warn', 'always'],
    'quotes': ['warn', 'single'],
    'indent': ['warn', 2],
    'comma-dangle': ['warn', 'never'],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'space-before-function-paren': ['warn', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'space-before-blocks': ['warn', 'always'],
    'keyword-spacing': ['warn', { 'before': true, 'after': true }],
    'arrow-spacing': ['warn', { 'before': true, 'after': true }],
    'eqeqeq': ['error', 'always'],
    'no-multiple-empty-lines': ['warn', { 'max': 1, 'maxEOF': 0 }],
    'padded-blocks': ['warn', 'never'],
    'no-trailing-spaces': 'warn',
    'spaced-comment': ['warn', 'always'],
    'camelcase': ['warn', { 'properties': 'never' }]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
};
