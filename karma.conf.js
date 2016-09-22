/* eslint-env node */

module.exports = function(config) {
  config.set({
    basePath: '.',

    frameworks: [
      'jasmine'
    ],

    files: [
      './test/jasmine/**/*.js'
    ],

    preprocessors: {
      'test/jasmine/**/*.js': ['webpack']
    },

    webpack: {
      module: {
        rules: [
          { test: /\.js$/, loader: 'babel' }
        ]
      },
      plugins: []
    },

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true,
        version: false,
        assets: false,
        chunks: false,
        chunkModules: false
      }
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

    coverageReporter: {
      reporters: [
        {
          type: 'text-summary'
        },
        {
          type: 'html',
          dir: 'coverage/'
        }
      ]
    }
  });
};
