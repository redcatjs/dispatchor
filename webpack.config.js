module.exports = {
  entry: {
    'browser': ['./src/index.js']
  },
  output: {
    filename: '[name].js',
    library: 'dispatchor',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  devtool: 'source-map'
}
