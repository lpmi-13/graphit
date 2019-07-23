const merge = require("webpack-merge");
const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  devtool: "#eval-source-map",
  devServer: {
    stats: {
      children: false,
      maxModules: 0,
    },
  },
});
