const {resolve} = require('path');

module.exports = {
  mode: 'development',
  entry: resolve(__dirname, './source/language/worker/console.worker.ts'),
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.amd.worker.js'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}