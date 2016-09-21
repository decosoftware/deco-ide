var path = require('path');
var webpack = require('webpack');

var alias = {
  // For node module development, we need this to ensure all modules requiring
  // react end up with the same instance of it.
  react: path.join(__dirname, 'node_modules/react'),
  shared: path.join(__dirname, '../shared/src'),
  yops: path.join(__dirname, 'node_modules/yops'),
  'react-dnd': path.join(__dirname, 'node_modules/react-dnd')
};

// Framer components can require other Framer components.
// This sets up the mapping correctly.
// TODO: Move into gulpfile?

module.exports = {
  entry: [
    "webpack-dev-server/client?http://0.0.0.0:8080",
    'webpack/hot/only-dev-server',
    './src/scripts/index'
  ],
  devtool: "cheap-module-eval-source-map",
  debug: true,
  cache: true,
  output: {
    path: path.join(__dirname, "public"),
    filename: 'bundle.js'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/vertx/), // https://github.com/webpack/webpack/issues/353
    new webpack.DefinePlugin({
      "DECO_DEBUG": 1,
      "process.env": {
        NODE_ENV: JSON.stringify("local")
      }
    })
  ],
  resolve: {
    alias: alias,
    extensions: ['', '.js', '.txt', '.jsx']
  },
  module: {
    // Don't warn about including pre-bundled js
    noParse: [
      /raven-js\/dist\/raven\.js$/,
      /socket.io-client\/socket.io.js/,
      /babel-core\/browser.js/
    ],
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css']},
      { test: /\.(png|svg)$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      { test: /\.txt$/, loader: "raw-loader" },
      { test: /\.jsx?$/, loaders: ['react-hot', 'babel'], include: path.join(__dirname, 'src'), exclude: '/node_modules/'},
      // { test: /\.jsx/, loader: 'babel', include: path.join(__dirname, 'node_modules/react-ui-tree/lib')},
      { test: /\.js/, loader: 'babel', include: [
        path.join(__dirname, '../shared/src'),
        path.join(__dirname, 'node_modules/react-hotkeys'),
      ]},
      { test: /\.json$/, loader: "json-loader" },
    ]
  }
};
