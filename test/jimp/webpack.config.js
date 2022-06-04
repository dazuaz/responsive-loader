const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'index'),
  module: {
    rules: [
      // This rule will be matched when the resourceQuery contains `minmax`, e.g. `cat-1000.jpg?minmax`
      {
        test: /\.(png|jpg)$/,
        resourceQuery: /minmax/,
        loader: require.resolve('../../lib/index'),
        options: {
          min: 100,
          max: 300,
          esModule: true,
          adapter: require('../../jimp'),
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(png|jpg)$/,
        loader: require.resolve('../../lib/index'),
        options: {
          sizes: [500, 750, 1000],
          esModule: true,
          adapter: require('../../jimp'),
        },
        type: 'javascript/auto',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'foobar/',
    filename: 'test.js',
  },
  target: 'node',
}
