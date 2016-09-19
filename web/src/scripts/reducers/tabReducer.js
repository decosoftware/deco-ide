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
import update from 'react-addons-update'

import { tabConstants as at } from '../actions'
import TabUtils from '../utils/TabUtils'

const initialState = {}

const tabReducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {

    case at.ADD_TAB: {
      const {containerId, tabId, position} = payload
      const container = TabUtils.addTab(state[containerId] || {}, tabId, position)
      return update(state, {[containerId]: {$set: container}})
    }

    case at.SWAP_TAB: {
      const {containerId, tabId, newTabId} = payload
      const container = TabUtils.swapTab(state[containerId] || {}, tabId, newTabId)
      return update(state, {[containerId]: {$set: container}})
    }

    case at.CLOSE_TAB: {
      const {containerId, tabId} = payload
      const container = TabUtils.closeTab(state[containerId] || {}, tabId)
      return update(state, {[containerId]: {$set: container}})
    }

    case at.FOCUS_TAB: {
      const {containerId, tabId} = payload
      const container = TabUtils.focusTab(state[containerId] || {}, tabId)
      return update(state, {[containerId]: {$set: container}})
    }

    case at.MAKE_TAB_PERMANENT: {
      const {containerId} = payload
      const container = TabUtils.makeTabPermanent(state[containerId] || {})
      return update(state, {[containerId]: {$set: container}})
    }

    case at.CLOSE_ALL_TABS: {
      const {containerId} = payload

      // If a containerId is passed, close all its tabs
      if (containerId) {
        return update(state, {[containerId]: {$set: null}})
        
      // Else, close all tabs for all containers
      } else {
        return {}
      }
    }

    default: {
      return state
    }
  }
}

export default tabReducer
