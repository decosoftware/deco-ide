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
const ipc = require('electron').ipcMain

import {
  ipcMain,
} from 'electron'
import { EventEmitter, } from 'events'

import Logger from '../log/logger'

class RequestEmitter extends EventEmitter {
  emit(channel, messageId, body, evt) {
    const callback = (err, data) => {
      try {
        evt.sender.send('response', messageId, err, data)
      } catch (e) {
        Logger.error(e)
      }
    }
    super.emit(channel, body, callback, evt)
  }
}

const emitter = new RequestEmitter()

ipcMain.on('request', (evt, messageId, channel, body) => {
  emitter.emit(channel, messageId, body, evt)
})

module.exports = emitter
