const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");
const port = 4444;

new WebpackDevServer(webpack(config), {
  contentBase: config.output.path,
  publicPath: config.output.publicPath,
  hot: process.env.NODE_ENV === "development",
  historyApiFallback: {
    disableDotRule: true,
  },
  stats: {
    colors: true,
  },
}).listen(port, "localhost", function(err) {
  if (err) {
    console.log(err);
  }

  console.log(`Listening at http://localhost:${port}`);
});
