const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = `${__dirname}/dist`;
module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: ['./src/index.js'],
    output: {
        publicPath: '/',
        filename: './bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [{loader: 'url-loader', options: {limit: 10000}}],
            },
            {
                test: /\.(js|jsx|py)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.py$/,
                use: [
                    {loader: path.resolve(__dirname, '../loader.js')}
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new copyWebpackPlugin([
            {from: './index.html', to: path.resolve(__dirname, 'dist')},
        ]),
    ],
    devtool: "source-map"
};

