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

import * as tabActions from '../actions/tabActions'
import * as editorActions from '../actions/editorActions'
import FileTreeActions from '../filetree/actions'
import TabUtils from '../utils/TabUtils'
import * as URIUtils from '../utils/URIUtils'
import { CONTENT_PANES } from '../constants/LayoutConstants'

export const openFile = (path) => async (dispatch, getState) => {
  dispatch(tabActions.addTab(CONTENT_PANES.CENTER, 'file://' + path))
  FileTreeActions.selectFile(path)
}

export const closeTabWindow = (closeTabId) => async (dispatch, getState) => {

  // Before modifying tab state, determine which tab to focus next
  const tabs = getState().ui.tabs
  const tabToFocus = TabUtils.determineTabToFocus(tabs[CONTENT_PANES.CENTER], closeTabId)
  const fileToFocus = tabToFocus && URIUtils.withoutProtocol(tabToFocus)

  dispatch(tabActions.closeTab(CONTENT_PANES.CENTER, closeTabId))

  // If there's another tab to open, open the file for it
  if (fileToFocus) {
    const filePath = getState().directory.filesById[fileToFocus].path
    dispatch(openFile(filePath))
  } else {
    dispatch(tabActions.clearFocusedTab(CONTENT_PANES.CENTER))
    dispatch(editorActions.clearCurrentDoc())
    FileTreeActions.clearSelections()
  }
}
