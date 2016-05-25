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
  ADD_TAB,
  MOVE_TAB,
  CLOSE_TAB,
  CLOSE_ALL_TABS,
  FOCUS_TAB,
  SWAP_TAB,
  MAKE_TAB_PERMANENT,
} from '../actions/tabActions'

import TabUtils from '../utils/TabUtils'

const initialState = {}

const tabReducer = (state = initialState, action) => {
  switch(action.type) {
    case ADD_TAB:
    {
      const {containerId, tabId, position} = action.payload
      return Object.assign({}, state, {
        [containerId]: TabUtils.addTab(state[containerId] || {}, tabId, position),
      })
    }
    break
    case SWAP_TAB:
    {
      const {containerId, tabId, newTabId} = action.payload
      return Object.assign({}, state, {
        [containerId]: TabUtils.swapTab(state[containerId] || {}, tabId, newTabId),
      })
    }
    break
    case CLOSE_TAB:
    {
      const {containerId, tabId} = action.payload
      return Object.assign({}, state, {
        [containerId]: TabUtils.closeTab(state[containerId] || {}, tabId),
      })
    }
    break
    case FOCUS_TAB:
    {
      const {containerId, tabId} = action.payload
      return Object.assign({}, state, {
        [containerId]: TabUtils.focusTab(state[containerId] || {}, tabId),
      })
    }
    break
    case MAKE_TAB_PERMANENT:
    {
      const {containerId} = action.payload
      return Object.assign({}, state, {
        [containerId]: TabUtils.makeTabPermanent(state[containerId] || {}),
      })
    }
    break
    case CLOSE_ALL_TABS:
    {
      const {containerId} = action.payload

      // If a containerId is passed, close all its tabs
      if (containerId) {
        return Object.assign({}, state, {
          [containerId]: null,
        })
      // Else, close all tabs for all containers
      } else {
        return {}
      }
    }
    break
    default:
      return state
    break
  }
}

export default tabReducer
