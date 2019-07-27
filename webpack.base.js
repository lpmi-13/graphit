const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: "url-loader",
          options: {
            limit: 10000,
            name: "[name].[ext]",
          },
        }],
      },
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== 'production' ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      favicon: "./src/images/favicon.ico",
    }),
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
    ]),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
};
