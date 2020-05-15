const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './source/index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devtool: 'cheap-source-map',
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.tsx']
  },
  devServer: {
    // contentBase: path.join(__dirname, 'public_dist'),
    // contentBasePublicPath: '/public_dist'
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
  },
  plugins: [new HtmlWebpackPlugin({template: './index.html'})]
}