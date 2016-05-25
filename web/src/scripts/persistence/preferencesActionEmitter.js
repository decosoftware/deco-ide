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

import LocalStorage from './LocalStorage'
import { setPreferences } from '../actions/preferencesActions'
import { ROOT_KEY, CATEGORIES, PREFERENCES, METADATA } from '../constants/PreferencesConstants'

const preferencesActionEmitter = (store) => {

  const mergeDefaults = (data) => {
    _.each(CATEGORIES, (categoryKey) => {
      data[categoryKey] = data[categoryKey] || {}
      _.each(PREFERENCES[categoryKey], (key) => {
        const preference = data[categoryKey][key]
        if (typeof preference === 'undefined') {
          data[categoryKey][key] = METADATA[categoryKey][key].defaultValue
        }
      })
    })
    return data
  }

  const handlePreferencesChange = (newValue) => {
    store.dispatch(setPreferences(newValue))
  }

  // Load initial data
  const data = mergeDefaults(LocalStorage.loadObject(ROOT_KEY))
  handlePreferencesChange(data)

  // Handle changes
  LocalStorage.on(ROOT_KEY, handlePreferencesChange)

}

export default preferencesActionEmitter
