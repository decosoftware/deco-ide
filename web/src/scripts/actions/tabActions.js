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

export const ADD_TAB = 'ADD_TAB'
export const addTab = (containerId, tabId, position) => {
  return {
    type: ADD_TAB,
    payload: {
      containerId,
      tabId,
      position,
    }
  }
}

// TODO: Implement
export const MOVE_TAB = 'MOVE_TAB'
export const moveTab = (containerId, tabId, position) => {
  return {
    type: MOVE_TAB,
    payload: {
      containerId,
      tabId,
      position,
    }
  }
}

export const CLOSE_TAB = 'CLOSE_TAB'
export const closeTab = (containerId, tabId) => {
  return {
    type: CLOSE_TAB,
    payload: {
      containerId,
      tabId,
    }
  }
}

export const CLOSE_ALL_TABS = 'CLOSE_ALL_TABS'
export const closeAllTabs = (containerId) => {
  return {
    type: CLOSE_ALL_TABS,
    payload: {
      containerId,
    }
  }
}

export const FOCUS_TAB = 'FOCUS_TAB'
export const focusTab = (containerId, tabId) => {
  return {
    type: FOCUS_TAB,
    payload: {
      containerId,
      tabId,
    }
  }
}
export const clearFocusedTab = (containerId) => {
  return {
    type: FOCUS_TAB,
    payload: {
      containerId,
      tabId: null,
    }
  }
}

export const SWAP_TAB = 'SWAP_TAB'
export const swapTab = (containerId, tabId, newTabId) => {
  return {
    type: SWAP_TAB,
    payload: {
      containerId,
      tabId,
      newTabId,
    }
  }
}

export const MAKE_TAB_PERMANENT = 'MAKE_TAB_PERMANENT'
export const makeTabPermanent = (containerId) => {
  return {
    type: MAKE_TAB_PERMANENT,
    payload: {
      containerId,
    }
  }
}
