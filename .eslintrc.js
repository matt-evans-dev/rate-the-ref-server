module.exports = {
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    'prettier/react',
    'plugin:react/recommended'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'no-await-in-loop': [1],
    camelcase: 0
  },
  settings: {
    react: {
      version: '16.7.0'
    }
  }
};
