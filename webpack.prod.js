const webpack = require("webpack");
const merge = require("webpack-merge");
const baseConfig = require("./webpack.base.js");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(baseConfig, {
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.js",
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true,
        },
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
    ]),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ],
});
