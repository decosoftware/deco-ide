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

const Logger = require('../log/logger')

import AcceleratorConstants from 'shared/constants/ipc/AcceleratorConstants'
const {
  SHOULD_CREATE_NEW_PROJECT,
  SHOULD_SAVE_PROJECT_AS,
  SHOULD_SAVE_PROJECT,
  SHOULD_OPEN_PROJECT_DIALOG,
  SHOULD_TOGGLE_TERM,
  SHOULD_CLOSE_TAB,
  OPEN_INSTALL_MODULE_DIALOG,
  OPEN_FILE,
} = AcceleratorConstants

export const shouldCreateProject = () => {
  return {
    type: SHOULD_CREATE_NEW_PROJECT,
  }
}

export const shouldSaveProject = () => {
  return {
    type: SHOULD_SAVE_PROJECT,
  }
}

export const shouldSaveProjectAs = () => {
  return {
    type: SHOULD_SAVE_PROJECT_AS,
  }
}

export const openProjectDialog = () => {
  return {
    type: SHOULD_OPEN_PROJECT_DIALOG,
  }
}

export const toggleTerm = () => {
  return {
    type: SHOULD_TOGGLE_TERM,
  }
}

export const shouldCloseTab = () => {
  return {
    type: SHOULD_CLOSE_TAB,
  }
}

export const openFile = (filePath) => {
  return {
    type: OPEN_FILE,
    filePath,
  }
}

export const openInstallModuleDialog = () => {
  return {
    type: OPEN_INSTALL_MODULE_DIALOG,
  }
}
