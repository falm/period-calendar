
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack");
var path = require('path');

var isProd = (process.env.NODE_ENV === 'production');

function getPlugins() {
    var plugins = [];

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }
    }));

    plugins.push(new CopyWebpackPlugin([
        { from: './src/index.html', to: 'index.html'},
        { from: './src/css/style.css', to: 'style.css'}
    ]));

    plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

    if (isProd) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    } else {
    }

    return plugins;
}

module.exports = {
    entry: {
        bundle: './src/js/main.js',
    },
    output: {
        path: './dist/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            // {test: /\.css$/, loader: 'style!css'},
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|vendor|dist)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
        ]
    },

    plugins: getPlugins()
};
