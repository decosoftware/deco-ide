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

import Logger from '../log/logger'
import Simulacra from 'deco-simulacra'

class SyncServiceController {
  constructor() {
    this.syncService = null
    this.noRestart = false
    process.on('SIGINT', this.closeService.bind(this, true))
    process.on('close', this.closeService.bind(this, true))
    process.on('exit', this.closeService.bind(this, true))
  }
  closeService = (noRestart) => {
    this.noRestart = noRestart
    if (this.syncService) {
      try {
        if (!this.syncService.killed) {
          this.syncService.kill('SIGINT')
        }
        this.syncService = null
      } catch (e) {
        this.syncService = null
      }
    }
  }
  start = () => {
    this.syncService = Simulacra.run()
    this.syncService.on('error', (err) => {
      closeService()
      this.start()
    })
    this.syncService.on('close', (err) => {
      closeService()
      this.start()
    })
  }
}

const SyncService = new SyncServiceController()
export default SyncService
