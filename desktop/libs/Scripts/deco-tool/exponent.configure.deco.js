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

const projectRoot = process.cwd()

const child_process = require('child_process')
const path = require('path')
const DECO = require('deco-tool')

DECO.on('run-packager', function(args) {
  return new Promise((resolve, reject) => {
    let exponentPackagerPath = path.resolve(
      projectRoot,
      'node_modules/@exponent/minimal-packager/cli.js'
    )

    var child = child_process.spawn(exponentPackagerPath, [], {
      env: process.env,
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    resolve({ child })
  })
})

DECO.on('build-ios', function (args) {
 // noop
})

DECO.on('build-android', function (args) {
  // noop
})

DECO.on('sim-android', function(args) {
  return openAppOnAndroid()
})

DECO.on('reload-android-app', function(args) {
  return openAppOnAndroid()
})

DECO.on('sim-ios', function(args) {
  return openAppOnIOS()
})

DECO.on('reload-ios-app', function(args) {
  return openAppOnIOS()
})

function openAppOnAndroid() {
  return new Promise((resolve, reject) => {
    const xdl = require(`${projectRoot}/node_modules/xdl`)

    xdl.Android.openProjectAsync(projectRoot).then(() => {
      resolve('Opened project on Android')
    }).catch(e => {
      reject(`Error opening project on Android: ${e.message}`)
    })
  })
}

function openAppOnIOS() {
  return new Promise((resolve, reject) => {
    const xdl = require(`${projectRoot}/node_modules/xdl`)

    xdl.Project.getUrlAsync(projectRoot).then(url => {
      xdl.Simulator.openUrlInSimulatorSafeAsync(url).then(() => {
        resolve('Opened project in iOS simulator')
      }).catch(e => {
        reject(`Error opening project in iOS simulator: ${e.message}`)
      })
    }).catch(e => {
      reject(`Error opening project in iOS simulator: ${e.message}`)
    })
  })
}
