/* eslint-env node */
const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    main: './src/index.js',
  },
  output: {
    filename: 'jasmine-stray-timers.js',
    path: path.join(__dirname, 'dist'),
  },
  target: 'web',
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
};
