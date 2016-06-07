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
  showSimulatorError,
  updateSimulatorStatus,
  updatePackagerStatus,
} from '../actions/processActions'
import {
  onSuccess,
  onError,
} from '../actions/genericActions'
import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
const {
  RUN_SIMULATOR,
  STOP_PACKAGER,
  RUN_PACKAGER,
  RESUME_PACKAGER,
  RESUME_SIMULATOR,
  HARD_RELOAD_SIMULATOR,
  LIST_AVAILABLE_SIMS,
} = ProcessConstants
import fileHandler from './fileHandler'
import preferenceHandler from './preferenceHandler'

import PackagerController from '../process/packagerController'
import SimulatorController from '../process/simulatorController'

import Logger from '../log/logger'

import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'
const injectOptionsFromPreferences = (options) => {
  const preferences = preferenceHandler.getPreferences()
  const androidHome = preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.ANDROID_HOME]
  if (androidHome == '') {
    Logger.info('Path to Android SDK is not set, android functionality may be broken as a result')
    return //just not worth it
  }
  options.env.ANDROID_HOME = androidHome
  options.env.PATH = `${options.env.PATH}:${path.join(androidHome, 'tools')}:${path.join(androidHome, 'platform-tools')}`
}

class ProcessHandler {
  register() {
    bridge.on(RUN_SIMULATOR, this.onRunSimulator.bind(this))
    bridge.on(STOP_PACKAGER, this.onStopPackager.bind(this))
    bridge.on(RUN_PACKAGER, this.onRunPackager.bind(this))
    bridge.on(RESUME_PACKAGER, this.onResumePackager.bind(this))
    bridge.on(RESUME_SIMULATOR, this.onResumeSimulator.bind(this))
    bridge.on(HARD_RELOAD_SIMULATOR, this.onHardReloadSimulator.bind(this))
    bridge.on(LIST_AVAILABLE_SIMS, this.listAvailableSims.bind(this))
    this._initMonitor()
  }

  _initMonitor() {
    this._monitorSimulatorProcess()
    process.on('exit', () => {
      this._simWatcher.kill()
    })

    process.on('SIGINT', () => {
      this._simWatcher.kill()
    })

    preferenceHandler.onPreferenceUpdate(() => {
      this._restartMonitorProcess()
    })

    setInterval(() => {
      if (!this._simWatcher || this._simWatcher.killed) {
        this._monitorSimulatorProcess()
      }
    }, 30000)
  }

  _handleMonitorMessage(message) {
    try {
      const simStatus = message.androidRunning || message.iosRunning
      if (SimulatorController.simulatorStatus != simStatus) {
        bridge.send(updateSimulatorStatus(simStatus))
      }

      SimulatorController.androidRunning = message.androidRunning
      SimulatorController.iosRunning = message.iosRunning
    } catch (e) {
      Logger.error(e)
    }
  }

  _monitorSimulatorProcess() {
    const options = {}
    options.env = Object.assign({}, options.env || {}, process.env)
    injectOptionsFromPreferences(options)
    options.stdio = 'inherit'

    this._simWatcher = child_process.fork(APP_WATCHER_FILE, [], options)

    this._simWatcher.on('message', this._handleMonitorMessage.bind(this))
  }

  _restartMonitorProcess() {
    try {
      this._simWatcher.kill()
    } catch (e) {
      Logger.error(e)
    }
    this._monitorSimulatorProcess()
  }

  onStopPackager(payload, respond) {
    try {
      if (PackagerController.stopPackager()) {
        respond(onSuccess(STOP_PACKAGER))
      } else {
        respond(onError('Error when stopping packager.'))
      }
    } catch(e) {
      Logger.error(e)
      respond(onError('Error when stopping packager.'))
    }
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
    SimulatorController.listAvailableSimulators(payload.platform)
      .then((response) => {
        if (response.error) {
          respond(showSimulatorError(response.payload))
        } else {
          respond(listAvailableSims(response.payload))
        }
      })
      .catch((err) => {
        Logger.error(err)
        respond(onError(LIST_AVAILABLE_SIMS))
      })
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

  onResumeSimulator(payload, respond) {
    // Only relaunches simulator if the Simulator.app is running and the controller's state has been preserved
    if (SimulatorController.isSimulatorRunning() && SimulatorController.lastUsedArgs() != null) {
      try {
        SimulatorController.runSimulator()
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

  onHardReloadSimulator(payload, respond) {
    try {
      SimulatorController.hardReload()
      respond(onSuccess())
    } catch (e) {
      Logger.error(e)
      respond(onError('Could not hard reload the application.'))
    }
  }

  onRunSimulator(payload, respond) {
    try {
      SimulatorController.runSimulator({
        simInfo: payload.simInfo,
        platform: payload.platform || 'ios',
      })
      respond(onSuccess(RUN_SIMULATOR))
    } catch (e) {
      Logger.error(e)
      respond(onError('Could not find the application binary in default path.'))
    }
  }
}

module.exports = new ProcessHandler()
