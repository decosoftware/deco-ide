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
const EventEmitter = require('events')
const Logger = require('../log/logger')

import TaskLauncher from './taskLauncher'
import bridge from '../bridge'
import {
  onPackagerOutput,
  onPackagerError,
  updatePackagerStatus,
} from '../actions/processActions'

const DEFAULT_OPTS = {
  packagerPort: 8081,
}

class PackagerController {
  constructor() {
    this._packagerProcess = null
    this._packagerPath = null
    this._packagerIsActive = false

    process.on('exit', () => {
      this.killPackager()
    })

    process.on('SIGINT', () => {
      this.killPackager()
    })
  }

  processIsRunning() {
    return this.isActive()
  }

  get packagerPath() {
    return this._packagerPath
  }

  emitPackagerState(obj) {
    if (obj == null || typeof obj == 'undefined') return
    this._packagerIsActive = obj.isAlive ? true : false
    bridge.send(updatePackagerStatus(this._packagerIsActive))
  }

  isActive() {
    return this._packagerIsActive
  }

  checkPackagerStatus() {
    if (!this._packagerProcess || this._packagerProcess.killed) {
      this.emitPackagerState({ isAlive: false })
    } else {
      this.emitPackagerState({ isAlive: true })
    }
  }

  stopPackager() {
    if (this.isActive()) {
      this.promiseKillPackager()
        .then(() => {
          return this.isActive()
        }).catch(() => {
          return this.isActive()
        })
    }

    return !this.isActive()
  }

  _runPackager(opts) {
    try {
      this._packagerProcess = TaskLauncher.runTask('run-packager')

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

      this._packagerProcess.once('exit', () => {
        this.emitPackagerState({ isAlive: false })
      })

      this._packagerProcess.once('SIGINT', () => {
        this.emitPackagerState({ isAlive: false })
      })

      this.checkPackagerStatus()

    } catch(e) {
      Logger.error(e)
    }
  }

  runPackager(opts) {
    this.promiseKillPackager()
      .then(() => {
        this._runPackager(opts)
      }).catch(() => {
        this._runPackager(opts)
      })
  }

  promiseKillPackager() {
    return new Promise((resolve, reject) => {
      let killCounter = 0
      const repeatedlyKill = setInterval(() => {
        if (killCounter > 3) {
          reject()
        } else if (!this._packagerProcess || this._packagerProcess.killed) {
          resolve()
          this.emitPackagerState({ isAlive: false })
        } else {
          killCounter += 1
          this.killPackager() // try to kill again
          return
        }
        clearInterval(repeatedlyKill)
      }, 150)
      this.killPackager()
    })
  }

  killPackager() {
    try {
      if (!!this._packagerProcess && !this._packagerProcess.killed) {
        this._packagerProcess.kill('SIGINT')
      }
    }
    catch (e) {
      Logger.error(e)
    }
  }
}



module.exports = new PackagerController()
