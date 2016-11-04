const gulp = require('gulp')
const gutil = require('gulp-util')
const gulpFail = require('gulp-fail')
const path = require('path')
const ElectronPackager = require('electron-packager')
const child_process = require('child_process')
const fs = require('fs')
const plist = require('plist')
const $ = require('gulp-load-plugins')()
const open = require('gulp-open')
const runSequence = require('run-sequence')
const fse = require('fs-extra')
const mocha = require('gulp-mocha')

// Utility functions
const {execSync} = child_process
const es = (cmd, options = {}) => execSync(cmd, Object.assign({stdio: 'inherit'}, options))
const cwd = (...args) => path.join(__dirname, ...args)

const BUILD_VERSION = "0.7.1"
const NODE_MODULES_VERSION = 50

const SIGN_PACKAGE = process.env['SIGN_DECO_PACKAGE'] == 'true'

var child = null
var debug_child = null

const paths = {
  app                        : cwd('../app'),
  assets                     : cwd('assets'),
  build                      : cwd('build'),
  dist                       : cwd('../dist'),
  dist_osx                   : cwd('../dist/osx'),
  electron_rebuild           : cwd('node_modules/.bin/electron-rebuild'),
  libs                       : cwd('libs'),
  package                    : cwd('package'),
  package_json               : cwd('package.json'),
  package_libs               : cwd('package/libs'),
  package_libs_node          : cwd('package/libs/node'),
  package_libs_node_unpacked : cwd('package/libs/node-v5.7.0-darwin-x64'),
  package_libs_node_tar      : cwd('package/libs/node-v5.7.0-darwin-x64.tar.gz'),
  postinstall                : cwd('libs/Scripts/pkg/Scripts/postinstall'),
  plist                      : cwd('../app/deco/Deco-darwin-x64/Deco.app/Contents/Info.plist'),
  public                     : cwd('public'),
  ship_n_zip                 : cwd('ship_n_zip.sh'),
}

gulp.task('clean-app', () => es(`rm -rf ${paths.app}`))
gulp.task('clean-build', () => es(`rm -rf ${paths.build}`))
gulp.task('clean-dist', () => es(`rm -rf ${paths.dist}`))
gulp.task('clean-package', () => es(`rm -rf ${paths.package}`))

gulp.task('clean', [
  'clean-app',
  'clean-build',
  'clean-dist',
  'clean-package',
])

gulp.task('make-dist-dir', () => es(`mkdir -p ${paths.dist_osx}`))

gulp.task('dev-unpack-lib', () => {
  es(`${paths.postinstall} dev ${paths.libs}`, {cwd: __dirname})
})

gulp.task('modify-plist', ['electron-pack'], (callback) => {
  const info = plist.parse(fs.readFileSync(paths.plist, 'utf8'))
  info.NSAppTransportSecurity = {
    NSAllowsArbitraryLoads: true
  }
  info.LSMinimumSystemVersion = "10.9.0"
  fs.writeFileSync(paths.plist, plist.build(info))
  return callback()
})

gulp.task('dist', ['modify-plist'], (callback) => {
  return child_process.execFileSync(paths.ship_n_zip, [BUILD_VERSION, SIGN_PACKAGE], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  })
})

gulp.task('rebuild-native-modules', () => {
  const modules = ['git-utils', 'nodobjc', 'ffi', 'ref', 'ref-struct']

  modules.forEach(module => {
    console.log('Building native module', module, 'for version', NODE_MODULES_VERSION)
    es(`${paths.electron_rebuild} --pre-gyp-fix --node-module-version ${NODE_MODULES_VERSION} --which-module ${module}`)
  })
})

gulp.task('setup-pack-folder', function(callback) {

  // Create package dir
  es(`rm -rf ${paths.package}/*`)
  es(`mkdir -p ${paths.package}`)

  // Copy assets, build, libs, package.json, and public into package dir
  es(`cp -rf ${paths.assets} ${paths.package}`)
  es(`cp -a ${paths.build} ${paths.package}`)
  es(`cp -rf ${paths.libs} ${paths.package}`)
  es(`cp -rf ${paths.package_json} ${paths.package}`)
  es(`cp -rf ${paths.public} ${paths.package}`)

  // Unzip the node source
  es(`tar -zxf ${paths.package_libs_node_tar} -C ${paths.package_libs}`)

  // Delete the node source if it already exists (may exist from local dev build)
  try {
    fs.statSync(paths.package_libs_node)
    fse.removeSync(paths.package_libs_node)
  } catch (e) {}

  // Rename the unpacked node source directory to 'node'
  es(`mv ${paths.package_libs_node_unpacked} ${paths.package_libs_node}`)

  // Delete the zipped node source
  fs.unlinkSync(paths.package_libs_node_tar)

  return callback()
})

gulp.task('electron-pack', ['setup-pack-folder'], function(callback) {
  var opts = {
    name: 'Deco',
    dir: path.join(__dirname, './package'),
    arch: 'all',
    platform: 'darwin',
    icon: path.join(__dirname, '/assets/icons/deco.icns'),
    version: '1.4.3',
    appVersion: BUILD_VERSION,
    overwrite: true,
    out: path.join(__dirname, '../app/deco'),
    asar: false
  };
  if (SIGN_PACKAGE) {
    opts.sign = 'Developer ID Application: Deco Software Inc. (M5Y2HY4UM2)'
  }

  opts['app-bundle-id'] = 'com.decosoftware.deco';
  opts['build-version'] = BUILD_VERSION;
  return ElectronPackager(opts, function(err, appPath) {
    if (err) {
      console.error(err);
      return gulpFail();
    } else {
      return callback();
    }
  });
});

// Apply babel transformation
function transform(params) {
  const sourceMaps = params && params.dev ? ' -s inline' : ''

  // Get babel-cli binary from node_modules
  const bin = path.join(__dirname, 'node_modules/.bin', 'babel')

  function createCommand(src, dest, presets, plugins) {
    return bin + ' ' + src + ' -d ' + dest + ' --presets ' + presets.join(',') + sourceMaps +
        (plugins ? ' --plugins ' + plugins.join(',') : '')
  }

  // Transform src -> build
  child_process.execSync(createCommand('src', 'build', ['es2015', 'stage-1'], ['transform-runtime']))

  // Transform ../shared/src -> node_modules/shared
  const sharedSrc = path.join(__dirname, '../shared/src')
  const sharedDest = path.join(__dirname, 'node_modules/shared')
  child_process.execSync(createCommand(sharedSrc, sharedDest, ['es2015']))

  // Copy shared package.json so npm doesn't warn on npm install
  const sharedPackageSrc = path.join(sharedSrc, '../package.json')
  const sharedPackageDest = path.join(sharedDest, 'package.json')
  child_process.execSync("cp " + sharedPackageSrc + ' ' + sharedPackageDest)

  // Copy node_modules
  child_process.execSync("rm -rf build/node_modules")
  child_process.execSync("cp -a node_modules build/")
}

gulp.task("setup-node-binary", function(callback) {
  try {
    fs.statSync(path.join(__dirname, 'libs/node'))
  } catch (e) {
    child_process.execSync('tar -zxf node-v5.7.0-darwin-x64.tar.gz', {
      cwd: path.join(__dirname, 'libs')
    });
    child_process.execSync('mv ' + path.join(__dirname, 'libs/node-v5.7.0-darwin-x64') + ' ' + path.join(__dirname, 'libs/node'));
  }
  return callback()
})

gulp.task("build", function(callback) {
  transform()
  return callback()
})

gulp.task("build-dev", function(callback) {
  transform({dev: true})
  return callback()
})

gulp.task('build-web', ['build', 'clean-dist'], function(callback) {
  child_process.execSync('npm run build', {
    cwd: path.join(__dirname, '../web')
  });
  child_process.execSync("cp -r " + (path.join(__dirname, '../web/public')) + " " + (path.join(__dirname, './')));
  return callback();
});

gulp.task("start", ["build", "setup-node-binary"], function(callback) {
  child = child_process.fork("" + (path.join(__dirname, './node_modules/.bin/electron')), [__dirname, "--dev-mode"], {
    cwd: __dirname,
    env: process.env
  });
});

gulp.task('debug', ['run-debug-processes'], function(callback) {
  gulp.src(__filename)
  .pipe(open({
    uri: 'http://127.0.0.1:3000/?port=5858',
    //TODO: needs to change for OS once we support other platforms
    app: '/Applications/Google\ Chrome.app',
  }))
  callback()
});

gulp.task("run-debug-processes", ["build-dev"], function(callback) {
  child = child_process.fork("" + (path.join(__dirname, './node_modules/.bin/electron')), ["--debug-brk=5858", __dirname, "--dev-mode"], {
    cwd: __dirname,
    env: process.env
  });
  debug_child = child_process.fork("" + (path.join(__dirname, './node_modules/.bin/electron')), [
    "node_modules/node-inspector/bin/inspector.js",
    "--web-port=3000",
  ], {
    cwd: __dirname,
    env: Object.assign({},
      process.env, {
        ELECTRON_RUN_AS_NODE: true,
      })
  });
  callback()
})

process.on('exit', function() {
  if (child != null && !child.killed) {
    child.kill();
  }
  if (debug_child != null && !debug_child.killed) {
    debug_child.kill();
  }
});

gulp.task('default', function() {
  return gulp.start('pack');
});

// NOTE:
// This task doesn't work correctly when called via `npm run ...`
// Call directly with gulp as: ./node_modules/.bin/gulp create-project-template
gulp.task('create-project-template', function(callback) {
  const pp = {
    libs               : cwd('libs'),
    project            : cwd('libs/Project'),
    compressed_modules : cwd('libs/modules.tar.bz2'),
    node_modules       : cwd('libs/Project/node_modules'),
  }

  // Remove existing Project and compressed modules
  es(`rm -rf ${pp.project}`)
  es(`rm -rf ${pp.compressed_modules}`)

  // Update to latest react-native-cli
  es(`npm install -g react-native-cli`)

  // Create Project
  es(`react-native init Project`, {cwd: pp.libs})

  // Build iOS binary
  es(`react-native run-ios --simulator "iPhone 6"`, {cwd: pp.project})

  // Compress node_modules
  // (use -C to change to project dir, and refer to node_modules relatively)
  es(`tar -cjf ${pp.compressed_modules} -C ${pp.project} node_modules`)

  // Delete node_modules
  es(`rm -rf ${pp.node_modules}`)

  callback()
})

// See NOTE on create-project-template
gulp.task('project-template', [
  'create-project-template',
  'dev-unpack-lib',
])

gulp.task('pack', [
  'clean',
  'make-dist-dir',
  'rebuild-native-modules',
  'build',
  'build-web',
  'setup-pack-folder',
  'electron-pack',
  'modify-plist',
  'dist'
])

gulp.task('test-integration', function() {
  return gulp.src(['tests/setup.js', 'tests/integration/**/*.test.js'], { read: false })
    .pipe(mocha({
      reporter: 'progress',
      timeout: 10000
    }))
    .once('error', (e) => {
      console.log(e);
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    });
});
