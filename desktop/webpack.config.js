var path = require('path')
var webpack = require('webpack')
var fs = require('fs')

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


module.exports = {
  entry: './src/main.js',
  target: 'atom',
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js'
  },
  resolve: {
    alias: {
      'shared': path.join(__dirname, '../shared/src'),
    }
  },
  resolveLoader: {
    modulesDirectories: ['..', 'node_modules']
  },
  node: {
     __dirname: false
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.ExternalsPlugin('commonjs', [
     'electron',
   ]),
  ],
  module: {
    loaders: [
      { test: /\.json$/, loader: "json-loader" },
      {
        loader: 'babel',
        test: /\.js$/,
        query: {
          presets: ['es2015',]
        }
      }
    ]
  },
  externals: nodeModules
}
