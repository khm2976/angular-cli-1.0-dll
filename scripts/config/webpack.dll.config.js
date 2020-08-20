const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['.js', '.ts']
    },
    entry: {
        vendor: [
            "underscore",
           // "@angular/core"
           // "@angular/common"
           // "@angular/..."
        ],
        polyfills: [
            "web-animations-js"
        ]
    },
    output: {
        path: path.join(process.cwd(), "dist/dll"),
		filename: "[name].js",
		library: "[name]_[hash]"
    },
    plugins: [
		new webpack.DllPlugin({
			context: path.join(process.cwd(), "dist"),
			path: path.join(process.cwd(), "dist/dll", "[name]-manifest.json"),
			name: "[name]_[hash]"
		})
	]
};
