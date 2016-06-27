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
import tabReducer from './tabReducer'

import {
  SET_CONSOLE_VISIBILITY,
  SET_CONSOLE_SCROLL_HEIGHT,
  SET_LEFT_SIDEBAR_VISIBILITY,
  SET_RIGHT_SIDEBAR_CONTENT,
  SET_RIGHT_SIDEBAR_WIDTH,
  SET_LEFT_SIDEBAR_WIDTH,
  SET_LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT,
  PUSH_MODAL,
  POP_MODAL,
  WINDOW_SIZE_CHANGED,
  START_PROGRESS_BAR,
  UPDATE_PROGRESS_BAR,
  END_PROGRESS_BAR,
  UPGRADE_STATUS,
  SET_SIMULATOR_MENU_PLATFORM,
} from '../actions/uiActions'

import {
  LAYOUT_KEY,
  LAYOUT_FIELDS,
  RIGHT_SIDEBAR_CONTENT,
} from '../constants/LayoutConstants'

const initialState = {
  [LAYOUT_FIELDS.CONSOLE_VISIBLE]: false,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE]: true,
  [LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT]: RIGHT_SIDEBAR_CONTENT.PROPERTIES,
  [LAYOUT_FIELDS.RIGHT_SIDEBAR_WIDTH]: 230,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_WIDTH]: 290,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT]: 300,
  [LAYOUT_FIELDS.SIMULATOR_MENU_PLATFORM]: 'iOS',
  scrollHeight: 9999,
  modalQueue: [],
  windowBounds: {
    x: window.screenX,
    y: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  tabs: undefined,
  progressBar: null,
  upgrade: {
    status: 'pending',
  }
}

const uiReducer = (state = initialState, action) => {

  state = _.cloneDeep(state)
  state.tabs = tabReducer(state.tabs, action)

  switch(action.type) {
    case WINDOW_SIZE_CHANGED:
      const {x, y, width, height} = action.spec
      return Object.assign({}, state, {
        windowSpec: action.spec,
        windowBounds: {
          x: typeof x !== 'undefined' ? x : state.windowBounds.x,
          y: typeof y !== 'undefined' ? y : state.windowBounds.y,
          width: typeof width !== 'undefined' ? width : state.windowBounds.width,
          height: typeof height !== 'undefined' ? height : state.windowBounds.height,
        },
      })
    case SET_CONSOLE_VISIBILITY:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.CONSOLE_VISIBLE]: action.payload,
      })
    case SET_CONSOLE_SCROLL_HEIGHT:
      return Object.assign({}, state, {
        scrollHeight: action.scrollHeight,
      })
    case SET_LEFT_SIDEBAR_VISIBILITY:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE]: action.payload,
      })
    case SET_RIGHT_SIDEBAR_CONTENT:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT]: action.payload,
      })
    case SET_RIGHT_SIDEBAR_WIDTH:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.RIGHT_SIDEBAR_WIDTH]: action.payload,
      })
    case SET_LEFT_SIDEBAR_WIDTH:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.LEFT_SIDEBAR_WIDTH]: action.payload,
      })
    case SET_LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT:
      return Object.assign({}, state, {
        [LAYOUT_FIELDS.LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT]: action.payload,
      })
    case SET_SIMULATOR_MENU_PLATFORM:
      return {
        ...state,
        [LAYOUT_FIELDS.SIMULATOR_MENU_PLATFORM]: action.payload,
      }
    case PUSH_MODAL:
      return Object.assign({}, state, {
         modalQueue: state.modalQueue.concat([action.modal]),
      })
    case POP_MODAL:
      // no modals are in the queue
      if (state.modalQueue.length == 0) {
        return state
      }
      return Object.assign({}, state, {
        modalQueue: state.modalQueue.slice(1, state.modalQueue.length)
      })
    case START_PROGRESS_BAR:
    {
      const {name, progress} = action.payload
      return {
        ...state,
        progressBar: {
          name,
          progress,
        }
      }
    }
    case UPDATE_PROGRESS_BAR:
    {
      const {name, progress} = action.payload

      if (! state.progressBar || name !== state.progressBar.name) {
        return state
      }

      // Ensure the progressbar never backtracks
      return {
        ...state,
        progressBar: {
          name,
          progress: Math.max(state.progressBar.progress, progress),
        }
      }
    }
    case UPGRADE_STATUS:
      const {status} = action.payload
      return {
        ...state,
        upgrade: {
          status,
        }
    }
    case END_PROGRESS_BAR:
      return {
        ...state,
        progressBar: null,
      }
    default:
      return state
  }
}

export default uiReducer
