const path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'index'),
  module: {
    rules: [
      // This rule will be matched when the resourceQuery contains `minmax`, e.g. `cat-1000.jpg?minmax`
      {
        test: /\.(png|jpe?g)$/,
        resourceQuery: /minmax/,
        use: [
          {
            loader: require.resolve('../../lib/index'),
            options: {
              min: 100,
              max: 300,
              adapter: require('../../sharp'),
            },
          },
        ],
        type: 'javascript/auto',
      },
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: require.resolve('../../lib/index'),
            options: {
              sizes: [500, 750, 1000],
              adapter: require('../../sharp'),
            },
          },
        ],
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
