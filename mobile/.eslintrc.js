module.exports = {
  root: true,
  extends: ['expo'],
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
