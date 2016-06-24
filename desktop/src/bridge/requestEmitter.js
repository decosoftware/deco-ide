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

function sendToRenderer(messageId, err, data, fromPreferences) {
  if (fromPreferences) {
    try {
      if (!global.preferencesWindow) return
      global.preferencesWindow.webContents.send('response', messageId, err, data)
    } catch (e) {
      //the preferences window may not be open...
      Logger.error(e)
    }
  } else {
    for (var id in global.openWindows) {
      global.openWindows[id].webContents.send('response', messageId, err, data)
    }
  }

}

class RequestEmitter extends EventEmitter {
  emit(channel, messageId, body, evt, fromPreferences) {
    const callback = (err, data) => {
      sendToRenderer(messageId, err, data, fromPreferences)
    }
    super.emit(channel, body, callback, evt, fromPreferences)
  }
}

const emitter = new RequestEmitter()

ipcMain.on('request', (evt, messageId, channel, body, fromPreferences) => {
  emitter.emit(channel, messageId, body, evt, fromPreferences)
})

module.exports = emitter
