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

'use strict'

const Logger = require('../log/logger')

import WindowConstants from 'shared/constants/ipc/WindowConstants'
const {
  OPEN_PROJECT_DIALOG,
  SAVE_AS_DIALOG,
  OPEN_PATH_CHOOSER_DIALOG,
  CONFIRM_DELETE_DIALOG,
} = WindowConstants

export const openProjectDialog = (path) => {
  return {
    type: OPEN_PROJECT_DIALOG,
    path: path,
  }
}

export const saveAsDialog = (path) => {
  return {
    type: SAVE_AS_DIALOG,
    path: path,
  }
}

export const openPathChooserDialog = (path) => {
  return {
    type: OPEN_PATH_CHOOSER_DIALOG,
    path: path,
  }
}

export const confirmDeleteDialog = (shouldDelete) => {
  return {
    type: CONFIRM_DELETE_DIALOG,
    shouldDelete: shouldDelete,
  }
}
