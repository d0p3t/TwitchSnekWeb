const webpack = require("webpack");
const path = require("path");

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: ["babel-polyfill", "./src/client/js/client.js"],
    output: {
        path: path.resolve("./dist/client/js"),
        filename: "client.js"
    },
    module: {
        loaders: [{ loader: "babel-loader" }]
    },
    //devtool: "source-map",
    plugins: [new UglifyJsPlugin({
        uglifyOptions: {
            ecma: 8
        }
    })]
};
