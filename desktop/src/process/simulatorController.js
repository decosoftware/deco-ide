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

import child_process from 'child_process'
import path from 'path'

import Logger from '../log/logger'
import {
  INTERNAL_LIB_FOLDER,
} from '../constants/DecoPaths'
const APP_WATCHER_FILE = path.join(INTERNAL_LIB_FOLDER, '/Scripts/appWatcher.js')

import SimulatorUtils from './utils/simulatorUtils'

import TaskLauncher from './taskLauncher'
import bridge from '../bridge'
import {
  onPackagerOutput,
  onPackagerError,
} from '../actions/processActions'

class SimulatorController {

  constructor() {
    this._lastUsedArgs = null
    this._androidRunning = false
    this._iosRunning = false
  }

  clearLastSimulator() {
    this._lastUsedArgs = null
  }

  lastUsedArgs() {
    return this._lastUsedArgs
  }

  isSimulatorRunning() {
    return this._androidRunning || this._iosRunning
  }

  get androidRunning() {
    return this._androidRunning
  }

  get iosRunning() {
    return this._iosRunning
  }

  set androidRunning(status) {
    this._androidRunning = status
  }

  set iosRunning(status) {
    this._iosRunning = status
  }

  get simulatorStatus() {
    return this.isSimulatorRunning()
  }

  runSimulator(args) {
    if (!args) {
      args = {}
      if (this._lastUsedArgs) {
        args = this._lastUsedArgs
      }
    }
    this._lastUsedArgs = args
    this._runSimulator(args)
  }

  hardReload() {
    if (this.androidRunning) {
      TaskLauncher.runTask('reload-android-app')
    }
    if (this.iosRunning) {
      TaskLauncher.runTask('reload-ios-app')
    }
  }

  _runIOS(args) {
    return TaskLauncher.runTask('sim-ios', args)
  }

  _runAndroid(args) {
    return TaskLauncher.runTask('sim-android', args)
  }

  _runSimulator(_args) {
    try {
      const args = TaskLauncher.objToArgString(_args.simInfo)
      const child = _args.platform == 'ios' ? this._runIOS(args) : this._runAndroid(args)
      if (!child) {
        return
      }

      child.stdout.on('data', (data) => {
        try {
          var plainTextData = data.toString()
          Logger.info(plainTextData)
          bridge.send(onPackagerOutput(plainTextData))
        } catch (e) {
          Logger.error(e)
        }
      })

      child.stderr.on('data', (data) => {
        try {
          var plainTextData = data.toString()
          Logger.error('packager stderr', plainTextData)
          // TODO
          // not going to distinguish between stderr and stdout for now
          bridge.send(onPackagerError(plainTextData))
        } catch (e) {
          Logger.error(e)
        }
      })


    } catch(e) {
      Logger.error(e)
    }
  }

  listAvailableSimulators(platform = 'ios') {
    return new Promise( (resolve, reject) => {
      const timeout = setTimeout(() => {
        try {
          resolve({
            error: true,
            payload: ['The task to find simulators took too long.', 'Try hitting the simulator button again or restarting Deco.']
          })
        } catch (e) {
          Logger.error(e)
          reject(e)
        }
      }, 30000)

      const cb = (obj) => {
        clearTimeout(timeout)
        resolve(obj)
      }

      switch (platform) {
        case 'ios':
          TaskLauncher.runManagedTask('list-ios-sim', [], null, cb)
          break
        case 'android':
          TaskLauncher.runManagedTask('list-android-sim', [], null, cb)
          break
        default:
          break
      }
    })
  }
}

module.exports = new SimulatorController()
