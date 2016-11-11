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
import { batchActions } from 'redux-batched-subscribe'

import TabUtils from '../utils/TabUtils'
import * as URIUtils from '../utils/URIUtils'
import LocalStorage from '../persistence/LocalStorage'

export const at = {
  ADD_TAB: 'ADD_TAB',
  MOVE_TAB: 'MOVE_TAB',
  CLOSE_TAB: 'CLOSE_TAB',
  FOCUS_TAB: 'FOCUS_TAB',
  SWAP_TAB: 'SWAP_TAB',
  CLOSE_ALL_TABS: 'CLOSE_ALL_TABS',
  MAKE_TAB_PERMANENT: 'MAKE_TAB_PERMANENT',
  RESTORE_TABS: 'RESTORE_TABS'
}

export const addTab = (containerId, tabId, groupIndex, index) => async (dispatch) => {
  dispatch({type: at.ADD_TAB, payload: {containerId, tabId, groupIndex, index}})
}

export const addTabToFocusedGroup = (containerId, tabId) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  if (!container) {
    //no files open, just default to splitRight behavior
    dispatch(splitRight(containerId, tabId))
  } else {
    const focusedGroupIndex = container.focusedGroupIndex
    const focusedGroup = container.groups[focusedGroupIndex]
    // if the focus is on storyboard, add the tab to the adjacent group
    if (focusedGroup.focusedTabId.includes('.storyboard.js')) {
      dispatch(addTab(containerId, tabId, focusedGroupIndex + 1))
    } else { // else we add it to the current focused group
      dispatch(addTab(containerId, tabId, focusedGroupIndex))
    }
  }
}

export const splitRight = (containerId, tabId) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const groupIndex = container ? container.groups.length : 0

  if (tabId) {
    dispatch(addTab(containerId, tabId, groupIndex))

  // If no tabId, attempt to split the current focused tab
  } else {
    const focusedTabId = TabUtils.getFocusedTabId(container)
    if (! focusedTabId) return

    dispatch(addTab(containerId, focusedTabId, groupIndex))
  }
}

// TODO: Implement
export const moveTab = (containerId, tabId, groupIndex, index) => async (dispatch) => {
  dispatch({type: at.MOVE_TAB, payload: {containerId, tabId, groupIndex, index}})
}

export const closeTab = (containerId, tabId, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const {tabIds} = TabUtils.getGroup(container, groupIndex)

  if (tabIds.includes(tabId)) {
    dispatch({type: at.CLOSE_TAB, payload: {containerId, tabId, groupIndex}})
  }
}

export const closeAllTabsForResource = (containerId, uri) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]

  const actions = TabUtils.getTabsForResource(container, uri)

    // Reverse the list, since groups are removed when empty, and the ids would shift
    .reverse()

    .map(({tabId, groupIndex}) => {
      return {type: at.CLOSE_TAB, payload: {containerId, tabId, groupIndex}}
    })

  dispatch(batchActions(actions))
}

export const closeAllTabs = (containerId) => async (dispatch) => {
  dispatch({type: at.CLOSE_ALL_TABS, payload: {containerId}})
}

export const focusAdjacentTab = (containerId, direction, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const group = TabUtils.getGroup(container, groupIndex)
  const focusedTabId = TabUtils.getAdjacentTab(group, direction)

  if (focusedTabId) {
    dispatch(focusTab(containerId, focusedTabId, groupIndex))
  }
}

export const focusAdjacentGroup = (containerId, direction) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const groupIndex = TabUtils.getAdjacentGroupIndex(container, direction)

  if (groupIndex >= 0) {
    const {focusedTabId} = TabUtils.getGroup(container, groupIndex)
    dispatch(focusTab(containerId, focusedTabId, groupIndex))
  }
}

export const focusTabByIndex = (containerId, index, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const {tabIds} = TabUtils.getGroup(container, groupIndex)

  if (index > tabIds.length - 1) return

  dispatch(focusTab(containerId, tabIds[index], groupIndex))
}

export const focusGroup = (containerId, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  if (!container) return

  const {groups} = container
  if (groupIndex > groups.length - 1) return

  const {focusedTabId} = TabUtils.getGroup(container, groupIndex)
  dispatch(focusTab(containerId, focusedTabId, groupIndex))
}

export const focusTab = (containerId, tabId, groupIndex) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId, groupIndex}})
}

export const clearFocusedTab = (containerId, groupIndex) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId: null, groupIndex}})
}

export const swapTab = (containerId, tabId, newTabId, groupIndex) => async (dispatch) => {
  dispatch({type: at.SWAP_TAB, payload: {containerId, tabId, newTabId, groupIndex}})
}

export const swapAllTabsForResource = (containerId, uri, newURI, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]

  const actions = TabUtils.getTabsForResource(container, uri)
    .map(({tabId, groupIndex}) => {
      const newTabId = URIUtils.replaceResource(tabId, newURI)
      return {type: at.SWAP_TAB, payload: {containerId, tabId, newTabId, groupIndex}}
    })

  dispatch(batchActions(actions))
}

export const makeTabPermanent = (containerId, tabId, groupIndex) => async (dispatch, getState) => {
  const container = getState().ui.tabs[containerId]
  const {ephemeralTabId} = TabUtils.getGroup(container, groupIndex)

  if (ephemeralTabId && (ephemeralTabId === tabId || !tabId)) {
    dispatch({type: at.MAKE_TAB_PERMANENT, payload: {containerId, groupIndex}})
  }
}

export const restoreTabs = () => async (dispatch, getState) => {
  const path = getState().directory.rootPath
  dispatch({type: at.RESTORE_TABS, payload: {tabs: LocalStorage.loadObject(path)}})
}
