const child_process = require('child_process');
const path = require('path');
const fs = require('fs');

DECO.on('run-packager', function(args) {
  return new Promise((resolve, reject) => {
    var child = child_process.spawn('react-native', ['start'], {
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    // Returning an object with 'child' property allows it to be killed when Deco closes
    resolve({ child })
  })
})

DECO.on('sim-ios', function(args) {
  try {
   child_process.spawnSync('xcrun', ['instruments', '-w', args.deviceId]);
  } catch(e) {
   // instruments always fail with 255 because it expects more arguments,
   // but we want it to only launch the simulator
  }

  child_process.spawnSync('xcrun', ['simctl', 'install', 'booted', args.target], {stdio: 'inherit'});

  var bundleID = child_process.execFileSync(
   '/usr/libexec/PlistBuddy',
   ['-c', 'Print:CFBundleIdentifier', path.join(args.target, 'Info.plist')],
   {encoding: 'utf8'}
  ).trim();

  child_process.spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleID], {stdio: 'inherit'});
  return Promise.resolve()
})

DECO.on('build-ios', function (args) {
  const ext = path.extname(args.project)
  const isWorkspace = ext === '.xcworkspace' ? true : false
  var xcodebuildArgs = [
   isWorkspace ? '-workspace' : '-project', args.project,
   '-scheme', args.scheme,
   '-destination', 'id=' + args.deviceId,
   '-derivedDataPath', 'build',
  ]

  const iosFolder = path.join(process.cwd(), 'ios')

  var child = child_process.spawn('xcodebuild', xcodebuildArgs, {
    stdio: 'inherit',
    cwd: iosFolder,
  })

  return Promise.resolve({ child })
})

DECO.on('sim-android', function (args) {
  return new Promise(function(resolve, reject) {
    var child = child_process.spawn('react-native', ['run-android'], {
      env: Object.assign({}, process.env, {
        ANDROID_HOME: `/Users/${process.env['USER']}/Library/Android/sdk`,
      }),
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    child.on('exit', function() {
      resolve()
    })
    child.on('close', function() {
      resolve()
    })
  })
})

DECO.on('build-android', function (args) {
  // not implemented
})

DECO.on('init-template', function (args) {
  fs.createReadStream(path.join(__dirname, 'configure.deco.js'))
    .pipe(fs.createWriteStream(path.join(process.cwd(), 'configure.deco.js')))
  return Promise.resolve()
})
