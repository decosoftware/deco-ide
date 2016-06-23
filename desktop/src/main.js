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

"use strict"
//ELECTRON REQUIRES
var Electron = require('electron')

var app = Electron.app
var _ = require('lodash')

//DEV MODE TOGGLE
var options = process.argv
var __DEV__ = options.length >= 3 && _.indexOf(options, '--dev-mode') != -1
global.__DEV__ = __DEV__

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.openWindows = {}

import os from 'os'
import child_process from 'child_process'

//DECO APP REQUIRES
var WindowManager = require('./window/windowManager.js')
var MenuHandler = require('./menu/menuHandler.js')
var Model = require('./fs/model.js')
var Logger = require('./log/logger.js')

import { registerHandlers, } from './handlers'

// Allows us to operate without error in browser
var electronRequire = require('electron')

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit()
  // }
})

var conditionallyAddWatchmanToPath = function() {
  // conditionally switch on our custom watchman instance
  let foundWatchman = false
  try {
    const result = child_process.spawnSync('watchman', ['version'], {
      env: process.env
    })

    if (result && result.stdout && result.stdout.toString().length > 0) {
      foundWatchman = true
    }
  } catch (e) {
    // something went wrong, so we'll fallback to our own
  }
  if (!foundWatchman) {
    process.env.PATH = process.env.PATH + ":" + '/usr/local/Deco/watchman'
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// THIS IS WHERE DECO APP FUNCTIONALITY SHOULD LIVE, EXERCISE CAUTION OUTSIDE THIS FUNCTION
app.on('ready', function() {
  //setup environment variables
  app.commandLine.appendSwitch('js-flags', '--harmony')
  conditionallyAddWatchmanToPath()


  Logger.info('Deco initializing...')

  //initialize & validate the app data directory on launch
  Model.init()
  //listen for ipc calls from renderer engine
  registerHandlers()

  //desktop size
  var electronScreen = Electron.screen
  var size = electronScreen.getPrimaryDisplay().workAreaSize
  //set the work area size for window manager
  global.workArea = size
  const version = app.getVersion()

  WindowManager.checkNeedsUpgrade(version).then(() => {
    //initialize browser window!
    WindowManager.newWindow(640, 450, false)

    // Preload window for performance
    WindowManager.initializePreferencesWindow()

    // create menu
    MenuHandler.instantiateTemplate()

    try {
      var UpdateManager = require('./updateManager.js')
      UpdateManager.init(version, 'osx_64')
    } catch (e) {
      Logger.error(e)
    }
  }).catch(() => {
    app.exit(0)
  })
})
