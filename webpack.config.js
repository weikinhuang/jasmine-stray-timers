/* eslint-env node */

module.exports = {
  devtool: 'eval',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'app.js',
    path: './dist/'
  },
  target: 'web',
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel' }
    ]
  }
};
