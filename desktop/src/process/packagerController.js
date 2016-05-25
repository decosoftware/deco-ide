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
const WATCHMAN_PATH = require('../constants/BinaryPaths').WATCHMAN_PATH
const NODE_PATH = require('../constants/BinaryPaths').NODE_PATH
const NODE_EXEC = path.join(NODE_PATH, '/bin/node')

import { app, } from 'electron'

import bridge from '../bridge'
import {
  onPackagerOutput,
  onPackagerError,
} from '../actions/processActions'

const fileHandler = require('../handlers/fileHandler')
const fs = require('fs-plus')

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
      opts = Object.assign({}, DEFAULT_OPTS, opts)
      if (!opts.rootPath) {
        opts.rootPath = fileHandler.getWatchedPath()
      }

      this._packagerPath = opts.rootPath

      const scriptPath = path.join(opts.rootPath, 'node_modules/react-native/local-cli/cli.js')
      if (!fs.existsSync(scriptPath)) {
        Logger.error('Could not find local packager cli at path: ' + scriptPath)
        return
      }
      const env = Object.assign({}, process.env, {
        PATH: process.env.PATH + ':' + WATCHMAN_PATH + ':' + NODE_PATH,
      })

      if (this._packagerProcess != null) {
        this.killPackager()
      }

      this._packagerProcess = child_process.spawn(NODE_EXEC, [
        scriptPath,
        'start',
        '--port', opts.packagerPort,
      ], {
          env: env,
        })

      this._packagerProcess.on('error', (error) => {
        Logger.error(error)
      })

      this._packagerProcess.stdout.on('data', (data) => {
        var plainTextData = data.toString()
        Logger.info(plainTextData)
        bridge.send(onPackagerOutput(plainTextData))
      })

      this._packagerProcess.stderr.on('data', (data) => {
        var plainTextData = data.toString()
        Logger.error('packager stderr', plainTextData)
        // TODO
        // not going to distinguish between stderr and stdout for now
        bridge.send(onPackagerError(plainTextData))
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
