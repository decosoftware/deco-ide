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

import child_process from 'child_process'
import path from 'path'

import _ from 'lodash'

import {
  INTERNAL_LIB_FOLDER,
  NODE_BINARIES,
} from '../constants/DecoPaths'

import Logger from '../log/logger'

const FORK_SYNC_SERVICE = 'Scripts/sync-service'

let syncService = null
const closeService = () => {
  if (syncService) {
    try {
      if (!syncService.killed) {
        syncService.kill('SIGINT')
      }
    } catch (e) {
      syncService = null
    }
  }
}

process.on('SIGINT', () => {
  closeService()
})
process.on('close', () => {
  closeService()
})
process.on('exit', () => {
  closeService()
})


class SyncServiceController {
  start = () => {
    syncService = child_process.fork('index', [], {
      cwd: path.join(INTERNAL_LIB_FOLDER, FORK_SYNC_SERVICE),
      env: {
        ...process.env,
        PATH: `${process.env.PATH}:${NODE_BINARIES}`
      }
    })
    syncService.on('error', (err) => {
      closeService()
      this.start()
    })
  }
}

const SyncService = new SyncServiceController()
export default SyncService
