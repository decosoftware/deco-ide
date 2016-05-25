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
  externals: [
    (function () {
      var IGNORES = [
        'electron'
      ];
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback();
      };
    })(),
  ].concat(nodeModules)
}
