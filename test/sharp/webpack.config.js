const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'index'),
  responsiveLoader: {
    sizes: [500, 750, 1000],
    adapter: require('../../lib/adapters/sharp')
  },
  module: {
    loaders: [{
      test: /\.(png|jpg)(\?.+)?$/,
      loader: require.resolve('../../lib/index')
    }]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'foobar/',
    filename: 'test.js'
  },
  target: 'node'
};
