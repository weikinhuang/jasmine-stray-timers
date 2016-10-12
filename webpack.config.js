/* eslint-env node */

module.exports = {
  devtool: 'inline-source-map',
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
