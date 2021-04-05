let state = {}
try {
  state = require('./state.json')
} catch (err) {
  state = {}
}

const { hasAddedReact } = state

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    ...(hasAddedReact
      ? {
          react: {
            version: 'detect'
          }
        }
      : {})
  },
  extends: [
    ...(hasAddedReact ? ['plugin:react/recommended'] : []),
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  plugins: [
    ...(hasAddedReact ? ['react', 'react-hooks'] : []),
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    ...(hasAddedReact
      ? {
          'react/prop-types': 'off',
          'react-hooks/exhaustive-deps': 'warn',
          'react-hooks/rules-of-hooks': 'error'
        }
      : {})
  },
  ignorePatterns: [
    'compiled/',
    'coverage/',
    'dist/',
    'node_modules/',
    '/*.js',
    '/*.json'
  ]
}
