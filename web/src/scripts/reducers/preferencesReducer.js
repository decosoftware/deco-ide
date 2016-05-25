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

import {
  SET_PREFERENCES,
  SET_PREFERENCE,
} from '../actions/preferencesActions'

const initialState = {}

const preferencesReducer = (state = initialState, action) => {
  switch(action.type) {
    case SET_PREFERENCES:
      return _.cloneDeep(action.payload)
    break
    case SET_PREFERENCE:
      const preferences = _.cloneDeep(state)
      const {categoryKey, key, value} = action.payload
      
      _.set(preferences, `${categoryKey}.${key}`, value)

      return preferences
    break
    default:
      return state
    break
  }
}

export default preferencesReducer
