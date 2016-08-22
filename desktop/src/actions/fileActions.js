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

import Logger from '../log/logger'

import FileConstants from 'shared/constants/ipc/FileConstants'
const {
  SAVE_SUCCESSFUL,
  ON_FILE_DATA,
  GET_FILE_DATA,
  GET_FILE_METADATA,
} = FileConstants


export const confirmSave = (filePath) => {
  return {
    type: SAVE_SUCCESSFUL,
    filePath,
  }
}

export const onExternalFileData = (path, utf8Data) => {
  return {
    type: ON_FILE_DATA,
    id: path,
    path: path,
    utf8Data: utf8Data,
  }
}

export const onFileData = (path, utf8Data) => {
  return {
    type: GET_FILE_DATA,
    id: path,
    path: path,
    utf8Data: utf8Data,
  }
}

export const onFileMetadata = (path, utf8Data) => {
  return {
    type: GET_FILE_METADATA,
    id: path,
    path: path,
    utf8Data: utf8Data,
  }
}
