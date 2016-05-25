var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var alias = {
  // For node module development, we need this to ensure all modules requiring
  // react end up with the same instance of it.
  react: path.join(__dirname, 'node_modules/react'),
  shared: path.join(__dirname, '../shared/src'),
};

module.exports = {
  entry: {
    app: [
      './src/scripts/index'
    ],
  },
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js",
  },
  resolveLoader: {
    modulesDirectories: ['..', 'node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      // This has effect on the react lib size.
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.IgnorePlugin(/vertx/),
    new webpack.IgnorePlugin(/un~$/),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    function()
    {
        this.plugin("done", function(stats)
        {
            if (stats.compilation.errors && stats.compilation.errors.length)
            {
                console.log(stats.compilation.errors);
                process.exit(1);
            }
            // ...
        });
    },
  ],
  resolve: {
    alias: alias,
    extensions: ['', '.js', '.txt', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css'] },
      { test: /\.(png|svg)$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.txt$/, loader: "raw-loader" },
      { test: /\.jsx?$/, loaders: ['babel'], include: path.join(__dirname, 'src'), exclude: '/node_modules/'},
      { test: /\.js/, loader: 'babel', include: path.join(__dirname, 'src'), exclude: '/node_modules/'},
      { test: /\.js/, loader: 'babel', include: [
        path.join(__dirname, '../shared/src'),
        path.join(__dirname, 'node_modules/react-hotkeys'),
      ]},
      { test: /\.json$/, loader: "json-loader" },
    ]
  }
};
