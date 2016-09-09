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

export const at = {
  ADD_TAB: 'ADD_TAB',
  MOVE_TAB: 'MOVE_TAB',
  CLOSE_TAB: 'CLOSE_TAB',
  FOCUS_TAB: 'FOCUS_TAB',
  SWAP_TAB: 'SWAP_TAB',
  CLOSE_ALL_TABS: 'CLOSE_ALL_TABS',
  MAKE_TAB_PERMANENT: 'MAKE_TAB_PERMANENT',
}

export const addTab = (containerId, tabId, position) => async (dispatch) => {
  dispatch({type: at.ADD_TAB, payload: {containerId, tabId, position}})
}

// TODO: Implement
export const moveTab = (containerId, tabId, position) => async (dispatch) => {
  dispatch({type: at.MOVE_TAB, payload: {containerId, tabId, position}})
}

export const closeTab = (containerId, tabId) => async (dispatch) => {
  dispatch({type: at.CLOSE_TAB, payload: {containerId, tabId}})
}

export const closeAllTabs = (containerId) => async (dispatch) => {
  dispatch({type: at.CLOSE_ALL_TABS, payload: {containerId}})
}

export const focusTab = (containerId, tabId) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId}})
}

export const clearFocusedTab = (containerId) => async (dispatch) => {
  dispatch({type: at.FOCUS_TAB, payload: {containerId, tabId: null}})
}

export const swapTab = (containerId, tabId, newTabId) => async (dispatch) => {
  dispatch({type: at.SWAP_TAB, payload: {containerId, tabId, newTabId}})
}

export const makeTabPermanent = (containerId) => async (dispatch) => {
  dispatch({type: at.MAKE_TAB_PERMANENT, payload: {containerId}})
}
