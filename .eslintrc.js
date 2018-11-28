module.exports = {
  extends: 'airbnb-base',
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'func-names': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { 'argsIgnorePattern': 'next' }]
  },
  overrides: [{
    files: ["*test*.js"],
    rules: {
      'global-require': 'off'
    }
  }]
};
