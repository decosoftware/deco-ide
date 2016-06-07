/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

'use strict'
const child_process = require('child_process')
const path = require('path')
const fs = require('fs')

const _ = require('lodash')
const adb = require('./util/adb.js')

const DECO = require('deco-tool')
const PROJECT_SETTING = DECO.setting

const checkEnvironmentOK = () => {
  if (!process.env.ANDROID_HOME) {
    const defaultSDKPath = `/Users/${process.env['USER']}/Library/Android/sdk`
    try {
      fs.statSync(defaultSDKPath)
    } catch (e) {
      return false
    }
    process.env.ANDROID_HOME = defaultSDKPath
    const tools = path.join(process.env.ANDROID_HOME, 'tools')
    const platformTools = path.join(process.env.ANDROID_HOME, 'platform-tools')
    process.env.PATH = `${process.env.PATH}:${tools}:${platformTools}`
  }
  return true
}

const rnCLI = () => {
  return path.resolve(__dirname, 'util/rn-cli.js')
}

const androidIsRunning = () => {
  let emuIsRunning = false
  try {
    const adbState = child_process.spawnSync('adb', ['get-state'], { env: process.env })
    // handle both newer and older versions of adb
    if (!!adbState.output[2]) {
      var adbErr = adbState.output[2].toString()
      if (adbErr != '' && adbErr.indexOf('error') == -1) {
        emuIsRunning = true
      }
    }
    if (!!adbState.output[1]) {
      var adbOut = adbState.output[1].toString()
      if (adbOut != '' && adbOut.indexOf('unknown') == -1) {
        emuIsRunning = true
      }
    }
  } catch (e) {
    // ¯\_(ツ)_/¯ whatever man
    console.log(e)
  }
  return emuIsRunning
}


/**
 * Run by default when launching the simulator,
 * or when manually starting/restarting the packager
 */
DECO.on('run-packager', function(args) {
  return new Promise((resolve, reject) => {
    var child = child_process.spawn(rnCLI(), ['start', "--port", PROJECT_SETTING.packagerPort], {
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    // Returning an object with 'child' property allows it to be killed when Deco closes
    resolve({ child, })
  })
})

DECO.on('list-ios-sim', function(args) {
  let text = ''
  try {
    text = child_process.execFileSync('xcrun', ['simctl', 'list', 'devices'], {encoding: 'utf8'})
  } catch (e) {
    return Promise.reject({
      payload: [
        'No simulators available.',
        'Please install Xcode and an iOS simulator to preview your project.'
      ]
    })
  }

  const targetAppPath = path.join(process.cwd(), path.dirname(PROJECT_SETTING.iosTarget))
  try {
    fs.statSync(targetAppPath)
  } catch (e) {
    if (e.code == 'ENOENT') {
      return Promise.reject({
        payload: [
          'iOS simulator cannot launch without building your project.',
          'Please hit cmd + B or Tools > Build Native Modules to build your project.',
          'If you have a custom build outside of Deco, go to Deco > Project Settings and change the "iosTarget" to your .app file location'
        ]
      })
    }
  }

  const devices = []
  var currentOS = null

  text.split('\n').forEach((line) => {
    var section = line.match(/^-- (.+) --$/)
    if (section) {
      var header = section[1].match(/^iOS (.+)$/)
      if (header) {
        currentOS = header[1]
      } else {
        currentOS = null
      }
      return
    }

    const device = line.match(/^[ ]*([^()]+) \(([^()]+)\)/)
    if (device && currentOS) {
      var name = device[1]
      var deviceId = device[2]
      devices.push({deviceId, name, version: currentOS,})
    }
  })
  const uniqueSims = _.chain(devices)
      .orderBy('version', 'desc')
      .unionBy('name')
      .reverse()
      .value()

  if (uniqueSims.length == 0) {
    return Promise.reject({
      payload: [
        'No simulators available.',
        'Please open Xcode and download iOS simulators.'
      ]
    })
  }

  const iphones = _.filter(uniqueSims, s => s.name.match(/iPhone/))
  const ipads = _.filter(uniqueSims, s => s.name.match(/iPad/))

  return Promise.resolve({ payload: iphones.concat(ipads) })
})

/**
 * This function is run when the "Simulator" button is clicked
 * or when "reloading" through the "Reload" button.
 *
 * The selected device chosen can be accessed from args.deviceId
 */
DECO.on('sim-ios', function(args) {
  const targetPath = path.join(process.cwd(), PROJECT_SETTING.iosTarget)
  try {
   child_process.spawnSync('xcrun', ['instruments', '-w', args.deviceId]);
  } catch(e) {
   // instruments always fail with 255 because it expects more arguments,
   // but we want it to only launch the simulator
  }

  child_process.spawnSync('xcrun', ['simctl', 'install', 'booted', targetPath], {stdio: 'inherit'});

  var bundleID = child_process.execFileSync(
   '/usr/libexec/PlistBuddy',
   ['-c', 'Print:CFBundleIdentifier', path.join(targetPath, 'Info.plist')],
   {encoding: 'utf8'}
  ).trim();

  child_process.spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleID], {stdio: 'inherit'});
  return Promise.resolve()
})

DECO.on('reload-ios-app', function(args) {
  const targetPath = path.join(process.cwd(), PROJECT_SETTING.iosTarget)
  var bundleID = child_process.execFileSync(
   '/usr/libexec/PlistBuddy',
   ['-c', 'Print:CFBundleIdentifier', path.join(targetPath, 'Info.plist')],
   {encoding: 'utf8'}
  ).trim();
  child_process.spawnSync('xcrun', ['simctl', 'install', 'booted', targetPath], {stdio: 'inherit'});
  child_process.spawnSync('xcrun', ['simctl', 'launch', 'booted', bundleID], {stdio: 'inherit'});

  return Promise.resolve()
})

/**
 * This function is run when hitting cmd+B or going to Tools > Build
 */
DECO.on('build-ios', function (args) {
  const ext = path.extname(PROJECT_SETTING.iosProject)
  const isWorkspace = ext === '.xcworkspace' ? true : false

  var xcodebuildArgs = [
   isWorkspace ? '-workspace' : '-project', path.basename(PROJECT_SETTING.iosProject),
   '-scheme', PROJECT_SETTING.iosBuildScheme,
   '-destination', 'id=' + args.deviceId,
   '-derivedDataPath', 'build',
  ]

  var child = child_process.spawn('xcodebuild', xcodebuildArgs, {
    stdio: 'inherit',
    cwd: path.join(process.cwd(), path.dirname(PROJECT_SETTING.iosProject)),
  })

  return Promise.resolve({ child })
})

/**
 * Returns a list of created devices from android emulator
 */
DECO.on('list-android-sim', function(args) {
  if (!checkEnvironmentOK()) {
    return Promise.resolve()
  }

  if (!process.env.ANDROID_HOME) {
    return Promise.reject({
      payload: [
        'No simulators available.',
        'Please install Android Studio and create an emulator.'
      ]
    })
  }

  if (process.env.USE_GENYMOTION) {
    return Promise.resolve({
      payload: [{
        name: 'Launch Device',
        identifier: 'launch',
      }, {
        name: 'Run Android',
        identifier: 'run',
      }]
    })
  }

  let text = ''
  try {
    text = child_process.execFileSync('emulator', ['-list-avds'], {encoding: 'utf8'})
    if (text == '') {
      return Promise.reject({
        payload: [
          'You have not created any devices yet.',
          'Please open Android Studio and create a new device, you will see the name listed here.'
        ]
      })
    }
  } catch (e) {
    return Promise.reject({
      payload: [
        'The Android SDK path is missing the "tools" sub-folder.',
        'Please check preferences (cmd + ,) to make sure your Android SDK path is set to the right location.',
      ]
    })
  }


  const devices = []
  text.split('\n').forEach((line) => {
    if (line != '') {
      devices.push({deviceId: line, name: line})
    }
  })
  return Promise.resolve({ payload: devices })
})

DECO.on('reload-android-app', function(args) {
  if (!checkEnvironmentOK()) {
    return Promise.resolve()
  }
  const packageName = fs.readFileSync(
    PROJECT_SETTING.androidManifest,
    'utf8'
    ).match(/package="(.+?)"/)[1]

  const devices = adb.getDevices()

  if (devices && devices.length > 0) {
    _.each(devices, (device) => {
      child_process.spawnSync('adb', ['-s', device, 'shell', 'am', 'force-stop', packageName], {stdio: 'inherit'});
      child_process.spawnSync('adb', ['-s', device, 'shell', 'am', 'start', '-n', packageName + '/.MainActivity'], {stdio: 'inherit'});
    })
  } else {
    _.each(devices, (device) => {
      child_process.spawnSync('adb', ['-s', device, 'shell', 'am', 'force-stop', packageName], {stdio: 'inherit'});
    })
    child_process.spawnSync('adb', ['shell', 'am', 'start', '-n', packageName + '/.MainActivity'], {stdio: 'inherit'});
  }

  return Promise.resolve()
})


DECO.on('sim-android', function (args) {
  return new Promise(function(resolve, reject) {
    if (!checkEnvironmentOK()) {
      resolve()
    }
    let emuProc = null

    if (!process.env.USE_GENYMOTION) {

      if (!androidIsRunning() && args.deviceId) {
        emuProc = child_process.spawn('emulator', [`@${args.deviceId}`], { env: process.env, stdio: 'inherit' })
      }

    } else {

      switch (args.identifier) {
        case 'run':
          break;
        case 'launch':
          const geny = child_process.spawn('open', ['/Applications/Genymotion.app'])
          resolve(Promise.resolve({ child: geny }))
          return
        default:
          resolve()
          return
      }
    }

    console.log('Waiting for Android Virtual Device to connect...')
    let ticker = 0
    const interval = setInterval(() => {
      if (androidIsRunning()) {
        child_process.fork(rnCLI(), ['run-android'], {
          env: process.env,
          cwd: process.cwd(),
          stdio: 'inherit',
        })
        clearInterval(interval)
      } else {
        ticker += 1
        if (ticker > 30) {
          console.log(`Device did not boot up in time, please wait for Android device to boot and then re-run this command.`)
          clearInterval(interval)
        } else {
          console.log(`Still waiting... for ${(30 - ticker)} more seconds.`)
        }
      }
    }, 1000)

    if (emuProc) {
      resolve({ child: emuProc })
    } else {
      resolve()
    }
  })
})


DECO.on('build-android', function (args) {
  // not implemented
})

/**
 * Likely can ignore this...
 * Creates a configure.deco.js in the working directory
 */
DECO.on('init-template', function (args) {
  fs.createReadStream(path.join(__dirname, 'template.configure.deco.js'))
    .pipe(fs.createWriteStream(path.join(process.cwd(), 'configure.deco.js')))
  return Promise.resolve()
})
