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
import LocalStorage from '../persistence/LocalStorage'
import { ROOT_KEY, CATEGORIES, PREFERENCES, METADATA } from 'shared/constants/PreferencesConstants'

import ApplicationConstants from 'shared/constants/ipc/ApplicationConstants'
const {
  BROADCAST_PREFERENCES,
} = ApplicationConstants

import WindowConstants from 'shared/constants/ipc/WindowConstants'
const {
  OPEN_PATH_CHOOSER_DIALOG,
} = WindowConstants

import request from '../ipc/Request'

const PREFERENCE_WINDOW_REQUEST = true

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

export const mergeSystemPreferences = (preferences) => {
  return function (dispatch, getState) {
    const currPreferences = getState().preferences
    _.each(_.keys(preferences), (categoryKey) => {
      _.each(_.keys(preferences[categoryKey]), (key) => {
        if (currPreferences[categoryKey][key] == METADATA[categoryKey][key].defaultValue) {
          dispatch(setPreference(categoryKey, key, preferences[categoryKey][key]))
        }
      })
    })
    return Promise.resolve()
  }
}

export const setSystemLocationPreference = (categoryKey, key, propertyType = 'openDirectory', title = 'Select Location') => {
  return function (dispatch) {
    return request(
      { type: OPEN_PATH_CHOOSER_DIALOG, propertyType, title, }, PREFERENCE_WINDOW_REQUEST
    ).then((resp) => {
      dispatch({
        type: SET_PREFERENCE,
        payload: {
          categoryKey,
          key,
          value: resp.path,
        }
      })
    })
  }
}

export const SET_PREFERENCES = 'SET_PREFERENCES'
export const setPreferences = (preferences) => {
  request({type: BROADCAST_PREFERENCES, preferences, })
  return {
    type: SET_PREFERENCES,
    payload: preferences,
  }
}

export const savePreferences = () => {
  return function(dispatch, getState) {
    request({type: BROADCAST_PREFERENCES, preferences: getState().preferences, })
    LocalStorage.saveObject(ROOT_KEY, getState().preferences)
  }
}
