const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'production',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js',
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 6,
                    compress: true,
                    mangle: true,
                },
            }),
        ],
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
});
