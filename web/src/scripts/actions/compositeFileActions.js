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

import {
  selectFile,
  clearSelections
} from '../actions/fileActions'

import {
  addTab,
  closeTab,
  clearFocusedTab
} from '../actions/tabActions'

import {
	clearCurrentDoc,
} from '../actions/editorActions'

import TabUtils from '../utils/TabUtils'

import { openDocument } from '../actions/editorActions'

import { CONTENT_PANES } from '../constants/LayoutConstants'

export const openFile = (file) => (dispatch, getState) => {
  dispatch(openDocument(file)).then(() => {
    dispatch(addTab(CONTENT_PANES.CENTER, file.id))
    dispatch(clearSelections())
    dispatch(selectFile(file.id))
  }).catch(() => {
    dispatch(addTab(CONTENT_PANES.CENTER, file.id))
    dispatch(clearSelections())
    dispatch(selectFile(file.id))
  })
}

export const closeTabWindow = (closeTabId) => (dispatch, getState) => {
	const tabs = getState().ui.tabs
	const tabToFocus = TabUtils.determineTabToFocus(tabs.CENTER.tabIds, closeTabId, tabs.CENTER.focusedTabId)
	dispatch(closeTab(CONTENT_PANES.CENTER, closeTabId))

	// If there's another tab to open, open the file for it
    if (tabToFocus) {
      dispatch(openFile(getState().directory.filesById[tabToFocus]))
    } else {
      dispatch(clearFocusedTab(CONTENT_PANES.CENTER))
      dispatch(clearCurrentDoc())
      dispatch(clearSelections())
    }
}
