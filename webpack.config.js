const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
	return {
		mode: 'production',
		entry: './src/index.ts',
		optimization: {
			minimize: false,
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader'],
					exclude: /node_modules/,
				},
				{
					test: /\.mp3$/,
					exclude: /node_modules/,
					type: 'asset/resource',
					generator: {
						filename: 'assets/audio/[name][ext]',
					},
				},
				{
					test: /\.json$/,
					exclude: /node_modules/,
					type: 'asset/resource',
					generator: {
						filename: 'assets/data/[name][ext]',
					},
				},
			],
		},
		resolve: {
			extensions: ['.ts', '.js'],
		},
		output: {
			filename: 'index.js',
			path: path.resolve(__dirname, 'build'),
		},
		externals: {
			p5: 'p5',
			lodash: '_',
			merge: 'merge',
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				inject: 'body',
				minify: false,
			}),
		],
	}
}
