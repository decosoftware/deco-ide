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

import LocalStorage from '../persistence/LocalStorage'
import { ROOT_KEY } from '../constants/PreferencesConstants'

export const SET_PREFERENCES = 'SET_PREFERENCES'
export const setPreferences = (preferences) => {
  return {
    type: SET_PREFERENCES,
    payload: preferences,
  }
}

export const SET_PREFERENCE = 'SET_PREFERENCE'
export const setPreference = (categoryKey, key, value) => {
  return {
    type: SET_PREFERENCE,
    payload: {
      categoryKey,
      key,
      value,
    }
  }
}

export const savePreferences = () => {
  return function(dispatch, getState) {
    LocalStorage.saveObject(ROOT_KEY, getState().preferences)
  }
}
