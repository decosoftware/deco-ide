var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpFail = require('gulp-fail');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");
var webpackProductionConfig = require("./webpack.production.config.js");
var map = require('map-stream');
var touch = require('touch');
var path = require('path');
var sequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');

var $ = require('gulp-load-plugins')();

gulp.task('css', function() {
  var processors;
  processors = [
    autoprefixer({
      browsers: ['last 1 version']
    })
  ];
  return gulp.src(['src/styles/*.sass', 'src/styles/*.scss']).pipe($.compass({
    css: 'public/',
    sass: 'src/styles',
    image: 'src/styles/images',
    style: 'nested',
    comments: false,
    bundle_exec: true,
    time: true,
    require: ['susy', 'modular-scale', 'normalize-scss', 'sass-css-importer', 'breakpoint']
  })).pipe(autoprefixer()).on('error', function(err) {
    return gutil.log(err);
  }).pipe($.size()).pipe(gulp.dest('public/')).pipe(map(function(a, cb) {
    if (typeof devServer.invalidate === "function") {
      devServer.invalidate();
    }
    return cb();
  }));
});

gulp.task('copy-assets', function(callback) {
  gulp.src('assets/**').pipe(gulp.dest('public'));
  return callback();
});

gulp.task("webpack:build", ['css'], function(callback) {
  return webpack(webpackProductionConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack:build", err);
    }
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    callback();
  });
});

devCompiler = webpack(webpackConfig);

gulp.task("webpack:build-dev", ['css'], function(callback) {
  devCompiler.run(function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack:build-dev", err);
    }
    gutil.log("[webpack:build-dev]", stats.toString({
      colors: true
    }));
    callback();
  });
});

devServer = {};

gulp.task("webpack-dev-server", function(callback) {
  touch.sync('./public/main.css', {
    time: new Date(0)
  });
  devServer = new WebpackDevServer(webpack(webpackConfig), {
    contentBase: './public/',
    historyApiFallback: true,
    hot: true,
    watchOptions: {
      aggregateTimeout: 100,
      poll: 300
    },
    noInfo: true
  });
  devServer.listen(8080, "0.0.0.0", function(err) {
    if (err) {
      throw new gutil.PluginError("webpack-dev-server", err);
    }
    gutil.log("[webpack-dev-server]", "http://localhost:8080");
    return callback();
  });
});

gulp.task('default', function() {
  return gulp.start('build');
});

gulp.task('build', ['webpack:build', 'copy-assets'], function(callback) {
  return callback();
});

gulp.task('watch', function() {
  return sequence('css', 'copy-assets', 'webpack-dev-server', function() {
    gulp.watch([path.join(__dirname, '/src/styles/**')], ['css']);
    return gulp.watch([path.join(__dirname, '/assets/**')], ['copy-assets']);
  });
});
