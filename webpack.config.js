const path = require('path');
const includes = [path.join(__dirname, 'src'), path.join(__dirname, 'assets')];
const es6modulePaths = [];
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = {
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].js',
    publicPath: '/docs',
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

const panel = Object.assign({}, baseConfig, {
  entry: {
    panel: path.join(__dirname, 'src/panel/index.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'perf.html',
      template: 'assets/index.html',
      // favicon: "assets/favicon.png",
    }),
  ],
});
const otherScripts = Object.assign({}, baseConfig, {
  entry: {
    background: path.join(__dirname, 'src/background/index.js'),
    devtools: path.join(__dirname, 'src/devtools/index.js'),
    content: path.join(__dirname, 'src/content/index.js'),
  },
});

module.exports = [panel, otherScripts];
