const path = require("path")

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "index"),
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        loader: require.resolve("../../lib/index"),
        options: {
          sizes: [500, 750, 1000],
          esModule: true,
          adapter: require("../../sharp"),
          cacheDirectory: true,
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "foobar/",
    filename: "test.js",
  },
  target: "node",
}
