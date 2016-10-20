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

import * as selectors from '../selectors'
import request from '../ipc/Request'
import LocalStorage from '../persistence/LocalStorage'
import { LAYOUT_KEY, LAYOUT_FIELDS, RIGHT_SIDEBAR_CONTENT } from '../constants/LayoutConstants'
import { RESIZE, CONFIRM_DELETE_DIALOG } from 'shared/constants/ipc/WindowConstants'

const _saveWindowBounds = (uiState) => {
  const data = {
    [LAYOUT_FIELDS.WINDOW_BOUNDS]: uiState[LAYOUT_FIELDS.WINDOW_BOUNDS],
  }
  const saved = LocalStorage.loadObject(LAYOUT_KEY)
  LocalStorage.saveObject(LAYOUT_KEY, Object.assign({}, saved, data))
}

const _saveLayout = (uiState) => {
  const data = {
    [LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT]: uiState[LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT],
    [LAYOUT_FIELDS.CONSOLE_VISIBLE]: uiState[LAYOUT_FIELDS.CONSOLE_VISIBLE],
    [LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE]: uiState[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
    [LAYOUT_FIELDS.SIMULATOR_MENU_PLATFORM]: uiState[LAYOUT_FIELDS.SIMULATOR_MENU_PLATFORM],
  }
  const saved = LocalStorage.loadObject(LAYOUT_KEY)
  LocalStorage.saveObject(LAYOUT_KEY, Object.assign({}, saved, data))
}

const saveLayout = (action) => (value) => (dispatch, getState) => {
  dispatch(action(value))
  _saveLayout(getState().ui)
}

export const saveWindowBounds = () => (dispatch, getState) => {
  _saveWindowBounds(getState().ui)
}

export const WINDOW_SIZE_CHANGED = 'WINDOW_SIZE_CHANGED'
export const setWindowSize = (spec) => {
  return {
    type: WINDOW_SIZE_CHANGED,
    spec: spec,
  }
}

function _resizeWindow(spec) {
  return Object.assign({}, spec, {
    type: RESIZE,
  })
}
export function resizeWindow(spec) {
  return function(dispatch) {
    request(_resizeWindow(spec)).then(() => {
      dispatch(setWindowSize(spec))
    })
  }
}

export const SET_SIMULATOR_MENU_PLATFORM = 'SET_SIMULATOR_MENU_PLATFORM'
export const setSimulatorMenuPlatform  = saveLayout((platform) => {
  return {
    type: SET_SIMULATOR_MENU_PLATFORM,
    payload: platform,
  }
})

export const SET_LEFT_SIDEBAR_VISIBILITY = 'SET_LEFT_SIDEBAR_VISIBILITY'
export const setLeftSidebarVisibility = saveLayout((visible) => {
  return {
    type: SET_LEFT_SIDEBAR_VISIBILITY,
    payload: visible,
  }
})

export const SET_CONSOLE_SCROLL_HEIGHT = 'CONSOLE_SCROLL_HEIGHT'
export const setConsoleScrollHeight = (scrollHeight) => {
  return {
    type: SET_CONSOLE_SCROLL_HEIGHT,
    scrollHeight: scrollHeight,
  }
}

export const SET_CONSOLE_VISIBILITY = 'SET_CONSOLE_VISIBILITY'
export const setConsoleVisibility = saveLayout((visible) => {
  return {
    type: SET_CONSOLE_VISIBILITY,
    payload: visible,
  }
})

export const SET_RIGHT_SIDEBAR_CONTENT = 'SET_RIGHT_SIDEBAR_CONTENT'
export const setRightSidebarContent = saveLayout((content) => {
  return {
    type: SET_RIGHT_SIDEBAR_CONTENT,
    payload: content,
  }
})

export const setSidebarContext = () => async (dispatch, getState) => {
  const element = selectors.selectedElement(getState())

  if (element) {
    return dispatch(setRightSidebarContent(RIGHT_SIDEBAR_CONTENT.PROPERTIES))
  } else {
    return dispatch(setRightSidebarContent(RIGHT_SIDEBAR_CONTENT.PUBLISHING))
  }
}

export const POP_MODAL = 'POP_MODAL'
export const popModal = () => {
  return {
    type: POP_MODAL,
  }
}

export const PUSH_MODAL = 'PUSH_MODAL'
export const pushModal = (element, closeOnBlur) => {
  return {
    type: PUSH_MODAL,
    modal: {
      element,
      closeOnBlur,
    }
  }
}

export const START_PROGRESS_BAR = 'START_PROGRESS_BAR'
export const startProgressBar = (name, progress) => {
  return {
    type: START_PROGRESS_BAR,
    payload: {
      name,
      progress,
    }
  }
}

export const UPDATE_PROGRESS_BAR = 'UPDATE_PROGRESS_BAR'
export const updateProgressBar = (name, progress) => {
  return {
    type: UPDATE_PROGRESS_BAR,
    payload: {
      name,
      progress,
    }
  }
}

export const END_PROGRESS_BAR = 'END_PROGRESS_BAR'
export const endProgressBar = (name, progress) => {
  return {
    type: END_PROGRESS_BAR,
    payload: {
      name,
      progress,
    }
  }
}

export const UPGRADE_STATUS = 'UPGRADE_STATUS'
export const upgradeStatus = (status) => {
  return {
    type: UPGRADE_STATUS,
    payload: {
      status,
    }
  }
}

export const confirmDelete = (deletePath) => async (dispatch, getState) => {
  return request({
    type: CONFIRM_DELETE_DIALOG,
    deletePath,
  })
}
