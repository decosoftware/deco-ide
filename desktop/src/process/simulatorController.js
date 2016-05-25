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

const Logger = require('../log/logger')
const LIB_FOLDER = require('../fs/model').LIB_FOLDER
const APP_WATCHER_FILE = path.join(LIB_FOLDER, '/Scripts/appWatcher.js')
const SimulatorUtils = require('./utils/simulatorUtils')

const DEFAULT_SIM = 'iPhone 6'
const defaultArgs = {
  simulator: DEFAULT_SIM,
}

class SimulatorController {

  constructor() {
    this._lastSimulatorArg = null
    this._simulatorIsOpen = false
  }

  clearLastSimulator() {
    this._lastSimulatorArg = null
  }

  lastSimulatorUsed() {
    return this._lastSimulatorArg
  }

  isSimulatorRunning() {
    return this._simulatorIsOpen
  }

  set simulatorStatus(status) {
    this._simulatorIsOpen = status || false
  }

  get simulatorStatus() {
    return this._simulatorIsOpen
  }

  _installApplication(args) {
    try {
      const installing = child_process.spawn('xcrun', ['simctl', 'install', 'booted', args.appPath])
      installing.on('close', (code) => {
        if (code != 0) {
          Logger.error('error on xcrun simctl install booted: ' + code)
        }
        this._bootApplication(args)
      })
    } catch (e) {
      Logger.error(e)
    }
  }

  _bootApplication(args) {
    try {
      const booting = child_process.spawn('xcrun', ['simctl', 'launch', 'booted', args.bundleID])
      booting.on('close', (code) => {
        if (code != 0) {
          Logger.error('error on xcrun simctl launch booted: ' + code)
          return
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  runSimulator(args) {
    this._lastSimulatorArg = args.simulator || DEFAULT_SIM
    this._runSimulator(Object.assign({}, defaultArgs, args))
  }

  _runSimulator(args) {
    try {
      const simulators = this.listAvailableSimulators()
      const selectedSimulator = SimulatorUtils.matchingSimulator(simulators, args.simulator)
      if (!selectedSimulator) {
        throw new `Cound't find ${args.simulator} simulator`
      }

      const simulatorFullName = `${selectedSimulator.name} (${selectedSimulator.version})`
      const sim = child_process.spawn('xcrun', ['instruments', '-w', selectedSimulator.udid], {
        stdio: 'inherit',
        env: process.env,
      })

      sim.on('close', (code) => {
        // instruments always fail with 255 because it expects more arguments,
        // but we want it to only launch the simulator
        if (code != 0 && code != 255) {
          Logger.error('error thrown on xcrun instruments: ' + code + ' for simulator name ' + simulatorFullName)
        }
        this._installApplication(args)
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  listAvailableSimulators() {
    try {
      const simulators = SimulatorUtils.parseSimulatorList(
        child_process.execFileSync('xcrun', ['simctl', 'list', 'devices'], {encoding: 'utf8'})
      )
      return simulators
    } catch(e) {
      Logger.error(e)
      return null
    }
  }
}

module.exports = new SimulatorController()
