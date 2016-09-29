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

import { routeActions, } from 'react-router-redux'

const ipc = Electron.ipcRenderer

import {
  save,
  saveAs,
  appendPackagerOutput,
  createProject,
  openProject,
  setSimulatorStatus,
  setPackagerStatus,
  customConfigError,
} from '../actions/applicationActions'

import {
  openInstallModuleDialog,
  openImportTemplateDialog,
} from '../actions/dialogActions'

import * as editorActions from '../actions/editorActions'

import { updateFileTreeVersion } from '../actions/fileActions'
import { openFile } from '../actions/compositeFileActions'

import {
  setConsoleVisibility,
  startProgressBar,
  updateProgressBar,
  endProgressBar,
  upgradeStatus,
} from '../actions/uiActions'

import { tabActions } from '../actions'

import AcceleratorConstants from 'shared/constants/ipc/AcceleratorConstants'
const {
  SHOULD_CREATE_NEW_PROJECT,
  SHOULD_OPEN_PROJECT_DIALOG,
  SHOULD_TOGGLE_TERM,
  SHOULD_CLOSE_TAB,
  SHOULD_SAVE_PROJECT,
  SHOULD_SAVE_PROJECT_AS,
  OPEN_INSTALL_MODULE_DIALOG,
  OPEN_IMPORT_TEMPLATE_DIALOG,
  OPEN_FILE,
} = AcceleratorConstants

import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  SAVE_PROJECT,
  SAVE_AS_PROJECT,
  SET_PROJECT_DIR,
  OPEN_PROJECT_SETTINGS,
  CUSTOM_CONFIG_ERROR,
} = ProjectConstants

import FileConstants from 'shared/constants/ipc/FileConstants'
const {
  ADD_SUB_PATH,
  ADD_SUB_PATH_BATCH,
  ON_FILE_DATA,
  REMOVE_SUB_PATH,
  REMOVE_SUB_PATH_BATCH,
  SAVE_SUCCESSFUL,
} = FileConstants

import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
const {
  PACKAGER_OUTPUT,
  UPDATE_SIMULATOR_STATUS,
  UPDATE_PACKAGER_STATUS,
} = ProcessConstants

import UIConstants from 'shared/constants/ipc/UIConstants'
const {
  PROGRESS_START,
  PROGRESS_UPDATE,
  PROGRESS_END,
  UPGRADE_STATUS,
} = UIConstants

import { ProcessStatus } from '../constants/ProcessStatus'

import { CONTENT_PANES } from '../constants/LayoutConstants'
import { closeTabWindow } from '../actions/compositeFileActions'
import { clearFileState, markSaved } from '../actions/fileActions'

/**
 * Ties ipc listeners to actions
 */
const ipcActionEmitter = (store) => {

  ipc.on(SET_PROJECT_DIR, (evt, payload) => {
    const rootPath = payload.absolutePath
    let query = {}
    if (payload.isTemp) {
      query.temp = true
    }
    store.dispatch(clearFileState())
    store.dispatch(editorActions.clearEditorState())
    store.dispatch(tabActions.closeAllTabs())
    const state = store.getState()
    store.dispatch(routeActions.push({
      pathname: `/workspace/${rootPath}`,
      query: query,
    }))
  })

  ipc.on(CUSTOM_CONFIG_ERROR, (evt, payload) => {
    store.dispatch(customConfigError(payload.errorMessage))
  })

  ipc.on(OPEN_INSTALL_MODULE_DIALOG, () => {
    store.dispatch(openInstallModuleDialog())
  })

  ipc.on(OPEN_IMPORT_TEMPLATE_DIALOG, () => {
    store.dispatch(openImportTemplateDialog())
  })

  ipc.on(SHOULD_OPEN_PROJECT_DIALOG, () => {
    store.dispatch(openProject())
  })

  ipc.on(SHOULD_CREATE_NEW_PROJECT, (evt, payload) => {
    store.dispatch(createProject())
  })

  ipc.on(PACKAGER_OUTPUT, (evt, payload) => {
    store.dispatch(appendPackagerOutput(payload))
  })

  ipc.on(UPDATE_SIMULATOR_STATUS, (evt, payload) => {
    store.dispatch(setSimulatorStatus(payload.simulatorIsOpen))
  })

  ipc.on(UPDATE_PACKAGER_STATUS, (evt, payload) => {
    const status = payload.status ? ProcessStatus.ON : ProcessStatus.OFF
    store.dispatch(setPackagerStatus(status))
  })

  ipc.on(ON_FILE_DATA, (evt, payload) => {
    store.dispatch(editorActions.loadDoc(payload))
  })

  ipc.on(SAVE_SUCCESSFUL, (evt, payload) => {
    store.dispatch(editorActions.markClean(payload.filePath))
    store.dispatch(markSaved(payload.filePath))
  })

  ipc.on(SHOULD_TOGGLE_TERM, () => {
    const state = store.getState()
    store.dispatch(setConsoleVisibility(!state.ui.consoleVisible))
  })

  ipc.on(SHOULD_CLOSE_TAB, () => {
    store.dispatch(closeTabWindow())
  })

  ipc.on(SHOULD_SAVE_PROJECT, () => {
    const state = store.getState()
    const location = state.routing.location
    if (location.query && location.query.temp == "true") {
      store.dispatch(saveAs())
    } else {
      store.dispatch(save())
    }
  })

  ipc.on(SHOULD_SAVE_PROJECT_AS, () => {
    store.dispatch(saveAs())
  })
  ipc.on(OPEN_FILE, (evt, obj) => {
    const { filePath } = obj
    store.dispatch(openFile(filePath))
  })
  ipc.on(OPEN_PROJECT_SETTINGS, (evt, obj) => {
    const { settingsPath } = obj
    // TODO how to handle this meow?
    // store.dispatch(addHiddenFileId(settingsInfo))
    store.dispatch(openFile(settingsPath))
  })

  ipc.on(PROGRESS_START, (evt, obj) => {
    const {name, progress} = obj.payload
    store.dispatch(startProgressBar(name, progress))
  })

  ipc.on(PROGRESS_UPDATE, (evt, obj) => {
    const {name, progress} = obj.payload
    store.dispatch(updateProgressBar(name, progress))
  })

  ipc.on(PROGRESS_END, (evt, obj) => {
    const {name, progress} = obj.payload
    store.dispatch(endProgressBar(name, progress))
  })

  ipc.on(UPGRADE_STATUS, (evt, obj) => {
    const {status} = obj.payload
    store.dispatch(upgradeStatus(status))
  })
}

export default ipcActionEmitter
