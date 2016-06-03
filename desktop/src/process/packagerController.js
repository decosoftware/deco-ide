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
const Logger = require('../log/logger')

import TaskLauncher from './taskLauncher'
import bridge from '../bridge'
import {
  onPackagerOutput,
  onPackagerError,
} from '../actions/processActions'

const DEFAULT_OPTS = {
  packagerPort: 8081,
}

class PackagerController {
  constructor() {
    this._packagerProcess = null
    this._packagerPath = null
  }

  processIsRunning() {
    return this._packagerProcess != null
  }

  get packagerPath() {
    return this._packagerPath
  }

  runPackager(opts) {
    try {
      if (this._packagerProcess != null) {
        this.killPackager()
      }

      this._packagerProcess = TaskLauncher.runTask('run-packager', ['--port', `${DEFAULT_OPTS.packagerPort}`])

      this._packagerProcess.stdout.on('data', (data) => {
        try {
          var plainTextData = data.toString()
          Logger.info(plainTextData)
          bridge.send(onPackagerOutput(plainTextData))
        } catch (e) {
          Logger.error(e)
        }
      })

      this._packagerProcess.stderr.on('data', (data) => {
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

      process.on('exit', () => {
        this.killPackager()
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  killPackager() {
    if (this._packagerProcess != null) {
      try {
        this._packagerProcess.kill()
        this._packagerProcess = null
      } catch(e) {
        Logger.error(e)
      }
    }
  }
}

module.exports = new PackagerController()
