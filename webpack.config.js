var ExtractTextPlugin = require('extract-text-webpack-plugin');

var clientEntry = {
    entry: "./src/client/main.js",
    output: {
        filename: "bundle.js",
        path: "public"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }]
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader'
                        }, 
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [
                                    './node_modules'
                                ]
                            }
                        }
                    ]
                })
            }
        ],
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        new ExtractTextPlugin('styles.css')
    ]
}

module.exports = [clientEntry]