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
  REGISTER_PATH,
  REMOVE_REGISTERED_PATH,
  MARK_SAVED,
  MARK_UNSAVED,
  CLEAR_FILE_STATE,
  UPDATE_FILE_TREE_VERSION,
  SET_TOP_DIR,
} from '../actions/fileActions'

const initialState = {
  filesById: {},
  version: 0,  //necessary to update the file tree component
  unsaved: {},
}

const fileReducer = (state = initialState, action) => {
  const { payload } = action
  switch(action.type) {
    case MARK_SAVED:
      const newSavedState = {
        ...state,
      }
      delete newSavedState.unsaved[action.id]
      return newSavedState
    case MARK_UNSAVED:
      console.log('marking unsaved', payload)
      return {
        ...state,
        unsaved: {
          ...state.unsaved,
          [payload.id]: true,
        }
      }
    case REGISTER_PATH:
      return {
        ...state,
        filesById: {
          ...state.filesById,
          ...payload,
        }
      }
    case REMOVE_REGISTERED_PATH:
      const newRegisteredState = {
        ...state,
      }
      delete newRegisteredState.filesById[action.filePath]
      return newRegisteredState
    case CLEAR_FILE_STATE:
      return {
        ...initialState,
      }
    case UPDATE_FILE_TREE_VERSION:
      return {
        ...state,
        version: payload.version,
      }
    case SET_TOP_DIR:
      const {rootPath, rootName} = payload
      return {...state, rootPath, rootName}
    default:
      return state
  }
}

export default fileReducer
