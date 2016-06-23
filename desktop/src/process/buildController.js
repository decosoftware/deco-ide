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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict'

import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

import findXcodeProject from './utils/findXcodeProject'
import simulatorUtils from './utils/simulatorUtils'
import xcodeUtils from './utils/xcodeUtils'
import TaskLauncher from './taskLauncher'

import bridge from '../bridge'
import {
  onPackagerOutput,
  onPackagerError,
} from '../actions/processActions'
import fileHandler from '../handlers/fileHandler'

import Logger from '../log/logger'

const defaultArgs = {
  simulator: 'iPhone 6'
}

let appPath = null
let bundleID = null

class BuildController {

  getAppPath() {
    return appPath
  }

  getBundleID() {
    return bundleID
  }

  buildIOS(_args, callback) {
    const args = Object.assign({}, defaultArgs, _args)
    try {
      const simulators = simulatorUtils.parseSimulatorList(
        child_process.execFileSync('xcrun', ['simctl', 'list', 'devices'], {encoding: 'utf8'})
      )

      const selectedSimulator = simulatorUtils.matchingSimulator(simulators, args.simulator)
      if (!selectedSimulator) {
        const err = `Couldn't find ${selectedSimulator} simulator`
        Logger.error(err)
        bridge.send(onPackagerOutput(err))
      }

      const xcodeBuildChild = TaskLauncher.runTask('build-ios', [
        '--deviceId', selectedSimulator.udid,
      ])

      xcodeBuildChild.stdout.on('data', (data) => {
        var plainTextData = data.toString()
        if (global.__DEV__) {
          Logger.info(plainTextData)
        }
        bridge.send(onPackagerOutput(plainTextData))
      })

      xcodeBuildChild.stderr.on('data', (data) => {
        var plainTextData = data.toString()
        Logger.error('build error ', plainTextData)
        // TODO
        // not going to distinguish between stderr and stdout for now
        bridge.send(onPackagerOutput(plainTextData))
      })

      xcodeBuildChild.on('close', (code) => {
        if (callback) callback()
      })
    } catch (e) {
      Logger.error(e)
    }
  }
}

module.exports = new BuildController()
