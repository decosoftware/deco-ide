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

import TabUtils from '../utils/TabUtils'

export const at = {
  ADD_TAB: 'ADD_TAB',
  MOVE_TAB: 'MOVE_TAB',
  CLOSE_TAB: 'CLOSE_TAB',
  FOCUS_TAB: 'FOCUS_TAB',
  SWAP_TAB: 'SWAP_TAB',
  CLOSE_ALL_TABS: 'CLOSE_ALL_TABS',
  MAKE_TAB_PERMANENT: 'MAKE_TAB_PERMANENT',
}

export const addTab = (containerId, tabId, groupIndex, index) => async (dispatch) => {
  dispatch({type: at.ADD_TAB, payload: {containerId, tabId, groupIndex, index}})
}

export const splitRight = (containerId, tabId) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const groupIndex = container ? container.groups.length : 0

  dispatch(addTab(containerId, tabId, groupIndex))
}

// TODO: Implement
export const moveTab = (containerId, tabId, groupIndex, index) => async (dispatch) => {
  dispatch({type: at.MOVE_TAB, payload: {containerId, tabId, groupIndex, index}})
}

export const closeTab = (containerId, tabId, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const {tabIds = []} = TabUtils.getGroup(container, groupIndex)

  if (tabIds.includes(tabId)) {
    dispatch({type: at.CLOSE_TAB, payload: {containerId, tabId}})
  }
}

export const closeAllTabs = (containerId) => async (dispatch) => {
  dispatch({type: at.CLOSE_ALL_TABS, payload: {containerId}})
}

export const focusTab = (containerId, tabId, groupIndex) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId, groupIndex}})
}

export const clearFocusedTab = (containerId, groupIndex) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId: null, groupIndex}})
}

export const swapTab = (containerId, tabId, newTabId) => async (dispatch) => {
  dispatch({type: at.SWAP_TAB, payload: {containerId, tabId, newTabId}})
}

export const makeTabPermanent = (containerId, tabId, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const {ephemeralTabId} = TabUtils.getGroup(container, groupIndex)

  if (ephemeralTabId && ephemeralTabId === tabId) {
    dispatch({type: at.MAKE_TAB_PERMANENT, payload: {containerId}})
  }
}
