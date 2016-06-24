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

import _ from 'lodash'
import { EventEmitter, } from 'events'
import requestEmitter from './requestEmitter'

import ApplicationConstants from 'shared/constants/ipc/ApplicationConstants'
import FileConstants from 'shared/constants/ipc/FileConstants'
import ComponentConstants from 'shared/constants/ipc/ComponentConstants'
import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
import WindowConstants from 'shared/constants/ipc/WindowConstants'
import ModuleConstants from 'shared/constants/ipc/ModuleConstants'

import ErrorConstants from 'shared/constants/ipc/ErrorConstants'
const {
  ERROR,
} = ErrorConstants


import Logger from '../log/logger'

const REQUEST_TYPES = [
  ApplicationConstants,
  FileConstants,
  ComponentConstants,
  ProcessConstants,
  ProjectConstants,
  WindowConstants,
  ModuleConstants,
]

function sendToRenderer(channel, payload, toPreferences) {
  if (!channel) {
    Logger.error('Channel was found broken', channel)
    return
  }
  //for the moment, we assume only one instance of the app is running
  if (!payload) {
    payload = {} // not sure if this will cause problems when undefined or null
  }

  if (toPreferences) {
    try {
      if (!global.preferencesWindow) return
      global.preferencesWindow.webContents.send(channel, payload)
    } catch (e) {
      //the preferences window may not be open...
      Logger.info('Warning: ', e)
    }
  } else {
    for (var id in global.openWindows) {
      global.openWindows[id].webContents.send(channel, payload)
    }
  }

}

class Bridge extends EventEmitter {

  constructor() {
    super()
    this._init()
    this._send = sendToRenderer
  }

  _init() {
    _.each(REQUEST_TYPES, (requestTypes) => {
      _.each(requestTypes, (id, requestType) => {
        requestEmitter.on(id, (body, callback, evt, fromPreferences) => {
          this.emit(id, body, (resp) => {
            if (resp && resp.type != ERROR) {
              callback(null, resp)
              return
            }
            callback(resp)
          }, evt)
        })
      })
    })
  }

  send(payload, toPreferences) {
    this._send(payload.type, payload, toPreferences)
  }

}

const bridge = new Bridge()

export default bridge
