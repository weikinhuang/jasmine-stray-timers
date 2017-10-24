/* eslint-env node */
const webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({
    basePath: '.',

    frameworks: [
      'jasmine',
    ],

    files: [
      './test/jasmine/**/*.js',
    ],

    preprocessors: {
      'test/jasmine/**/*.js': ['webpack'],
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true,
        version: false,
        assets: false,
        chunks: false,
        chunkModules: false,
      },
    },

    reporters: ['progress', 'coverage'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    reportSlowerThan: 250,

    browsers: ['PhantomJS'],

    singleRun: false,

    concurrency: Infinity,

    mochaReporter: {
      ignoreSkipped: true,
    },

    coverageReporter: {
      reporters: [
        {
          type: 'text-summary',
        },
        {
          type: 'html',
          dir: 'coverage/',
        },
      ],
    },
  });
};
