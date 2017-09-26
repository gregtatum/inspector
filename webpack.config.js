const path = require('path');
const includes = [path.join(__dirname, 'src'), path.join(__dirname, 'assets')];
const es6modulePaths = [];
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/background/index.js'),
    devtools: path.join(__dirname, 'src/devtools/index.js'),
    panel: path.join(__dirname, 'src/panel/index.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'perf.html',
      template: 'assets/index.html',
      // favicon: "assets/favicon.png",
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].js',
    publicPath: '/',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: includes.concat(es6modulePaths),
      },
    ],
  },
};
