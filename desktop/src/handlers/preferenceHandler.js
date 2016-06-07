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

import path from 'path'
import _ from 'lodash'

import bridge from '../bridge'
import {
  sendSystemPaths,
} from '../actions/preferenceActions'

import ApplicationConstants from 'shared/constants/ipc/ApplicationConstants'
const {
  BROADCAST_PREFERENCES,
  GET_SYSTEM_PATHS,
} = ApplicationConstants

import { PREFERENCES, CATEGORIES } from 'shared/constants/PreferencesConstants'

import {
  onSuccess,
  onError,
} from '../actions/genericActions'

import Logger from '../log/logger'

class PreferenceHandler {
  constructor() {
    this._preferences = {}
    this._callbacks = []
  }

  register() {
    bridge.on(BROADCAST_PREFERENCES, this.storePreferences.bind(this))
    bridge.on(GET_SYSTEM_PATHS, this.getSystemPaths.bind(this))
  }

  onPreferenceUpdate(cb) {
    this._callbacks.push(cb)
  }

  _defaultPreferences() {
    return {
      [CATEGORIES.GENERAL]: {
        [PREFERENCES[CATEGORIES.GENERAL].ANDROID_HOME]: path.join(`/Users/${process.env['USER']}`, '/Library/Android/sdk'),
      },
    }
  }

  getPreferences() {
    if (!this._preferences[CATEGORIES.GENERAL]) {
      this._preferences = this._defaultPreferences()
    }

    return this._preferences
  }

  getSystemPaths(payload, respond) {
    respond(sendSystemPaths(this._defaultPreferences()))
  }

  storePreferences(payload, respond) {
    if (payload.preferences) {
      this._preferences = payload.preferences
    }

    _.each(this._callbacks, (cb) => {
      cb()
    })
    respond(onSuccess(BROADCAST_PREFERENCES))
  }
}

const handler = new PreferenceHandler()
export default handler
