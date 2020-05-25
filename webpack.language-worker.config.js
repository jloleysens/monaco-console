const path = require('path')

const createConfig = (lang) => ({
  mode: 'development',
  entry: path.resolve(__dirname, `./source/${lang}/worker/${lang}.worker.ts`),
  output: {
    path: path.resolve(__dirname, 'public_dist'),
    filename: 'bundle.amd.worker.js',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, `./tsconfig.${lang}.worker.json`),
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
})

module.exports = { createConfig }
