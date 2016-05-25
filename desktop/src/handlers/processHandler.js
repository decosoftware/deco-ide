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

import fs from 'fs'
import path from 'path'
import child_process from 'child_process'

import fsp from 'fs-plus'
import _ from 'lodash'

import xcodeUtils from '../process/utils/xcodeUtils'
import findXcodeProject from '../process/utils/findXcodeProject'

import { LIB_FOLDER } from '../fs/model'
const APP_WATCHER_FILE = path.join(LIB_FOLDER, '/Scripts/appWatcher.js')

import bridge from '../bridge'
import {
  onPackagerError,
  onPackagerOutput,
  listAvailableSims,
  updateSimulatorStatus,
} from '../actions/processActions'
import {
  onSuccess,
  onError,
} from '../actions/genericActions'
import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
const {
  RUN_SIMULATOR,
  RUN_PACKAGER,
  RESUME_PACKAGER,
  RESUME_SIMULATOR,
  LIST_AVAILABLE_SIMS,
} = ProcessConstants
import fileHandler from './fileHandler'
import PackagerController from '../process/packagerController'
import SimulatorController from '../process/simulatorController'

import Logger from '../log/logger'

class ProcessHandler {
  register() {
    bridge.on(RUN_SIMULATOR, this.onRunSimulator.bind(this))
    bridge.on(RUN_PACKAGER, this.onRunPackager.bind(this))
    bridge.on(RESUME_PACKAGER, this.onResumePackager.bind(this))
    bridge.on(RESUME_SIMULATOR, this.onResumeSimulator.bind(this))
    bridge.on(LIST_AVAILABLE_SIMS, this.listAvailableSims.bind(this))
    this._monitorSimulatorProcess()
  }

  _monitorSimulatorProcess() {
    this._simWatcher = child_process.fork(APP_WATCHER_FILE)
    this._simWatcher.on('message', (message) => {
      if (SimulatorController.simulatorStatus != message.simStatus) {
        bridge.send(updateSimulatorStatus(message.simStatus))
      }

      SimulatorController.simulatorStatus = message.simStatus
    })

    this._simWatcher.on('exit', (code) => {
      if (code != 0) {
        this._simWatcher = child_process.fork(APP_WATCHER_FILE)
        this._simWatcher.on('message', (message) => {
          SimulatorController.simulatorStatus = message.simStatus
        })
      }
    })

  }

  onRunPackager(payload, respond) {
    PackagerController.runPackager(payload)
    respond(onSuccess(RUN_PACKAGER))
  }

  onResumePackager(payload, respond) {
    if (PackagerController.processIsRunning()) {
      PackagerController.runPackager(payload)
      respond(onSuccess(RESUME_PACKAGER))
    }
  }

  listAvailableSims(payload, respond) {
    const simList = SimulatorController.listAvailableSimulators()
    if (!simList) {
      respond(onError(LIST_AVAILABLE_SIMS))
    } else {
      respond(listAvailableSims(simList))
    }
  }

  _findAppFile(dir) {
    let foundApp = null
    try {
      const dirChildren = fsp.listSync(dir)
      _.each(dirChildren, (file) => {
        if (path.extname(file) == '.app') {
          foundApp = file
        }
      })
      return foundApp
    } catch (e) {
      Logger.error(e)
    }
    return foundApp
  }

  _getSimArgs() {
    const relativeAppDir = 'ios/build/Build/Products/Debug-iphonesimulator'
    const absoluteAppDir = path.join(fileHandler.getWatchedPath(), relativeAppDir)

    fs.statSync(absoluteAppDir)
    //it exists, so we should find the info
    const runPath = path.join(fileHandler.getWatchedPath(), 'ios')
    const xcodeProject = findXcodeProject(fs.readdirSync(runPath))
    const inferredSchemeName = xcodeUtils.inferredSchemeName(xcodeProject)
    const appPath = xcodeUtils.getAppPath(runPath, inferredSchemeName)
    const bundleID = xcodeUtils.getBundleID(appPath)

    return {
      appPath: appPath,
      bundleID: bundleID,
    }
  }

  onResumeSimulator(payload, respond) {
    // Only relaunches simulator if the Simulator.app is running and the controller's state has been preserved
    if (SimulatorController.isSimulatorRunning() && SimulatorController.lastSimulatorUsed() != null) {
      try {
        var args = this._getSimArgs()
        SimulatorController.runSimulator(Object.assign({}, args, {
          simulator: SimulatorController.lastSimulatorUsed(),
        }))
        respond(onSuccess(RESUME_SIMULATOR))
      } catch (e) {
        Logger.error(e)
        respond(onError('Could not find the application binary in default path.'))
      }
    } else {
      // onSuccess will trigger the simulator status to be on
      respond(onError(RESUME_SIMULATOR))
    }
  }

  onRunSimulator(payload, respond) {
    try {
      SimulatorController.runSimulator(Object.assign({}, this._getSimArgs(), {
        simulator: payload.name || 'iPhone 6'
      }))
      respond(onSuccess(RUN_SIMULATOR))
    } catch (e) {
      Logger.error(e)
      respond(onError('Could not find the application binary in default path.'))
    }
  }
}

module.exports = new ProcessHandler()
