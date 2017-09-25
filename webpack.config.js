const path = require("path");
const includes = [path.join(__dirname, "src"), path.join(__dirname, "assets")];
const es6modulePaths = [];
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src",
  plugins: [
    new HtmlWebpackPlugin({
      title: "perf.html",
      template: "assets/index.html",
      // favicon: "assets/favicon.png",
    })
  ],
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[hash].bundle.js",
    chunkFilename: "[id].[hash].bundle.js",
    publicPath: "/",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ["babel-loader"],
        include: includes.concat(es6modulePaths),
      },
    ]
  },
};
