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

import _ from 'lodash'
import { EventEmitter, } from 'events'

class LocalStorage extends EventEmitter {

  constructor() {
    super()

    window.addEventListener('storage', this.emitChange.bind(this))
  }

  emitChange({key, newValue}) {
    this.emit(key, this.normalizeItem(newValue))
  }

  normalizeItem(item) {
    if (! item) {
      return null
    }

    return JSON.parse(item)
  }

  loadObject(key, withDefault = {}) {

    // Returns a string if key exists, or undefined otherwise
    const item = localStorage.getItem(key)

    return this.normalizeItem(item) || withDefault
  }

  saveObject(key, object = {}) {
    localStorage.setItem(key, JSON.stringify(object))
  }

}

export default new LocalStorage()
