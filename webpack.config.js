/* eslint-env node */

module.exports = {
  devtool: 'eval',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'jasmine-stray-timers.js',
    path: './dist/'
  },
  target: 'web',
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel' }
    ]
  }
};
