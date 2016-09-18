
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack");
var path = require('path');

module.exports = {
    entry: './src/js/main.js',
    output: {
        path: './dist/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css'},
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|vendor|dist)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },

    plugins: [
        new CopyWebpackPlugin([
            { from: './src/index.html', to: 'index.html'}
        ]),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};
