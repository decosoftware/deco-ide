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
  addTab
} from '../actions/tabActions'

import { openDocument } from '../actions/editorActions'

import { CONTENT_PANES } from '../constants/LayoutConstants'

export const openFile = (file) => (dispatch, getState) => {
  dispatch(openDocument(file))
  dispatch(addTab(CONTENT_PANES.CENTER, file.id))
  dispatch(clearSelections())
  dispatch(selectFile(file.id))
}
