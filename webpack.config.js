module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname+'/dist',
        filename: "scrapio.js",
        library: 'scrapio',
        libraryTarget: 'var'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" }
        ]
    }
};