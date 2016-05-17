var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'index'),
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: 'foobar/',
    filename: 'test.js'
  },
  target: 'node'
}
