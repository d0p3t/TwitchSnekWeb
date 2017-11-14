const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: ["babel-polyfill", "./src/client/js/client.js"],
    output: {
        path: path.resolve("./dist/client/js"),
        filename: "client.js"
    },
    module: {
        loaders: [{ loader: "babel-loader" }]
    },
    devtool: "source-map",
    //plugins: [new webpack.optimize.UglifyJsPlugin()]
};
