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

import * as selectors from '../selectors'
import * as tabActions from '../actions/tabActions'
import * as editorActions from '../actions/editorActions'
import FileTreeActions from '../filetree/actions'
import TabUtils from '../utils/TabUtils'
import * as URIUtils from '../utils/URIUtils'
import { CONTENT_PANES } from '../constants/LayoutConstants'

export const openFile = (path, tabGroupIndex) => async (dispatch, getState) => {
  dispatch(tabActions.addTab(CONTENT_PANES.CENTER, URIUtils.filePathToURI(path), tabGroupIndex))
  FileTreeActions.selectFile(path)
}

export const closeTabWindow = (closeTabId, tabGroupIndex) => async (dispatch, getState) => {
  closeTabId = closeTabId || selectors.focusedTabId(getState())

  await dispatch(tabActions.closeTab(CONTENT_PANES.CENTER, closeTabId, tabGroupIndex))

  const focusedFileId = selectors.focusedFileId(getState())

  if (focusedFileId) {
    FileTreeActions.selectFile(focusedFileId)
  } else {
    dispatch(editorActions.clearCurrentDoc())
    FileTreeActions.clearSelections()
  }
}
