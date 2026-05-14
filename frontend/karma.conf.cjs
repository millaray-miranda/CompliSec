module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      { pattern: 'src/tests/**/*.spec.jsx', watched: false }
    ],
    preprocessors: {
      'src/tests/**/*.spec.jsx': ['webpack']
    },
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-webpack'
    ],
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.js', '.jsx']
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      }
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    },
    singleRun: true
  });
};
