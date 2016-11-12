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

import request from '../ipc/Request'

import ApplicationConstants from 'shared/constants/ipc/ApplicationConstants'
const {
  GET_SYSTEM_PATHS,
} = ApplicationConstants

import WindowConstants from 'shared/constants/ipc/WindowConstants'
const {
  OPEN_PROJECT_DIALOG,
  SAVE_AS_DIALOG,
  RESIZE,
} = WindowConstants
import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  CREATE_NEW_PROJECT,
  OPEN_PROJECT,
} = ProjectConstants
import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
const {
  RUN_SIMULATOR,
  STOP_PACKAGER,
  RUN_PACKAGER,
  RESUME_PACKAGER,
  RESUME_SIMULATOR,
  LIST_AVAILABLE_SIMS,
  HARD_RELOAD_SIMULATOR,
} = ProcessConstants
import FileConstants from 'shared/constants/ipc/FileConstants'
const {
  WRITE_FILE_DATA,
} = FileConstants

const FlowController = Electron.remote.require('./process/flowController.js')
import { ProcessStatus, } from '../constants/ProcessStatus'
import { mergeSystemPreferences, savePreferences } from './preferencesActions'
import { restoreTabs } from './tabActions'
import { saveMetadata } from './metadataActions'
import RecentProjectUtils from '../utils/RecentProjectUtils'
import { getLocalVersion } from '../utils/PackageUtils'
import LocalStorage from '../persistence/LocalStorage'
import { shouldPromptForFlowInstallation, didPromptForFlowInstallation } from '../utils/FlowUtils'

import { PREFERENCES, CATEGORIES } from 'shared/constants/PreferencesConstants'

function _openProject(path, resumeState = false) {
  return {
    type: OPEN_PROJECT,
    path,
    resumeState,
  }
}

function _openProjectDialog() {
  return {
    type: OPEN_PROJECT_DIALOG,
  }
}

export function openProject(projectPath = null) {
  return function(dispatch, getState) {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Project',
      eventAction: 'open',
    })

    const open = (path) => {
      request(_openProject(path)).then(() => {
        RecentProjectUtils.addProjectPath(path)
        dispatch(restoreTabs())
      })
    }

    // If given a path, open it
    if (projectPath) {
      open(projectPath)

    // Otherwise, prompt the user
    } else {
      request(_openProjectDialog()).then((resp) => {
        open(resp.path)
      })
    }
  }
}

function _createNewProject() {
  return {
    type: CREATE_NEW_PROJECT,
    tmp: true,
  }
}
export function createProject() {
  return function(dispatch) {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Project',
      eventAction: 'create',
    })
    request(_createNewProject())
  }
}

function _runSimulator(simInfo = {}, platform = 'ios') {
  return {
    type: RUN_SIMULATOR,
    simInfo,
    platform,
  }
}

function _resumeSimulator() {
  return {
    type: RESUME_SIMULATOR,
  }
}

export function hardReloadSimulator() {
  return function(dispatch) {
    request({ type: HARD_RELOAD_SIMULATOR })
  }
}

export function runSimulator(simInfo, platform) {
  return function(dispatch) {
    request(_runSimulator(simInfo, platform))
  }
}

export function resumeSimulator() {
  return function(dispatch) {
    request(_resumeSimulator())
  }
}

function _runPackager(rootPath) {
  return {
    type: RUN_PACKAGER,
    rootPath,
  }
}

function _stopPackager() {
  return {
    type: STOP_PACKAGER,
  }
}

function _resumePackager(rootPath) {
  return {
    type: RESUME_PACKAGER,
    rootPath,
  }
}

export const stopPackager = () => async (dispatch, getState) => {
  if (getState().application.packagerStatus) {
    console.log("getting in there")
    request(_stopPackager()).then((err) => {
      dispatch(setPackagerStatus(ProcessStatus.OFF))
    })
  }
}

export function runPackager(rootPath) {
  return function(dispatch, getState) {
    if (typeof rootPath == 'undefined' || rootPath == null) {
      rootPath = getState().directory.rootPath
    }
    request(_runPackager(rootPath)).then((err) => {
      dispatch(setPackagerStatus(ProcessStatus.ON))
    })
  }
}

export function resumePackager(rootPath) {
  return function(dispatch, getState) {
    if (typeof rootPath == 'undefined' || rootPath == null) {
      rootPath = getState().directory.rootPath
    }
    request(_resumePackager(rootPath)).then((err) => {
      dispatch(setPackagerStatus(ProcessStatus.ON))
    }).catch((err) => {
      dispatch(setPackagerStatus(ProcessStatus.OFF))
    })
  }
}

function _askForSimulatorList(platform) {
  return { type: LIST_AVAILABLE_SIMS, platform, }
}

function _onSimulatorListReceived(resp, platform, error) {
  return {
    type: GET_AVAILABLE_SIMULATORS,
    payload: {
      simList: resp.simList,
      message: resp.message,
    },
    platform,
    error,
  }
}

export const GET_AVAILABLE_SIMULATORS = "GET_AVAILABLE_SIMULATORS"
export function getAvailableSimulators(platform = 'ios') {
  return function(dispatch, getState) {
    request(_askForSimulatorList(platform))
      .then((resp) => {
        dispatch(_onSimulatorListReceived(resp, platform, resp.error))
      }).catch((err) => {
        // big fail
      })
  }
}

export const PACKAGER_OUTPUT = 'PACKAGER_OUTPUT'
export const appendPackagerOutput = (payload) => {
  return {
    type: PACKAGER_OUTPUT,
    output: payload.value,
  }
}

export const SIMULATOR_STATUS = 'SIMULATOR_STATUS'
export const setSimulatorStatus = (status) => {
  return {
    type: SIMULATOR_STATUS,
    status: status,
  }
}

export const PACKAGER_STATUS = 'PACKAGER_STATUS'
export const setPackagerStatus = (status) => {
  return {
    type: PACKAGER_STATUS,
    status: status,
  }
}

function _saveAsDialog(rootPath) {
  return {
    type: SAVE_AS_DIALOG,
    rootPath,
  }
}

function _writeFileData(filePath, data) {
  return {
    type: WRITE_FILE_DATA,
    filePath,
    data,
  }
}

export const CONFIG_ERROR_MESSAGE = 'CONFIG_ERROR_MESSAGE'
export const customConfigError = (errorMessage) => {
  return {
    type: CONFIG_ERROR_MESSAGE,
    payload: {
      configError: errorMessage || '',
    }
  }
}

export const clearConfigError = () => {
  return {
    type: CONFIG_ERROR_MESSAGE,
    payload: {
      configError: '',
    }
  }
}

export const FLOW_ERROR = 'FLOW_ERROR'
export const setFlowError = (e) => {
  return {
    type: FLOW_ERROR,
    payload: e,
  }
}

const checkAndPromptForFlow = (path) => (dispatch) => {

  // For now, always prompt if in temp project folder.
  // TODO Include flow in default project.
  const inTempProjectFolder = path.match(/.Deco\/tmp/)

  if (!inTempProjectFolder && !shouldPromptForFlowInstallation(path)) {
    return dispatch(setFlowError(null))
  }

  didPromptForFlowInstallation(path)

  return getLocalVersion('flow-bin')
    .then(() => FlowController.startServer())
    .catch((e) => dispatch(setFlowError(e)))
}

export const initializeProcessesForDir = (path) => {
  return function(dispatch, getState) {
    dispatch(setPackagerStatus(ProcessStatus.OFF))
    dispatch(getAvailableSimulators('ios'))
    dispatch(getAvailableSimulators('android'))
    dispatch(checkAndPromptForFlow(path))

    request({ type: GET_SYSTEM_PATHS }).then((response) => {
      dispatch(mergeSystemPreferences(response.payload)).then(() => {
        dispatch(savePreferences())
      })
    })
  }
}

const saveAllFiles = (state, dispatch) => {
  //TODO this is fine for small projects, but we'll need some kind of way to guarantee
  // the copy happens only after all files are saved.
  _.each(state.editor.docCache, (doc, id) => {
    if (doc && !doc.isClean(0)) {
      // TODO possibly a race condition if file data saves before metadata
      dispatch(saveMetadata(id))

      const data = doc.code
      request(_writeFileData(id, data))
    }
  })
}

export const saveLive = () => {
  return function(dispatch, getState) {
    saveAllFiles(getState(), dispatch)
  }
}

export const save = () => {
  return function(dispatch, getState) {
    //check if this is a temp project
    const state = getState()
    if (state.routing.location.query && state.routing.location.query.temp) {
      saveAs()
    } else {
      saveAllFiles(state, dispatch)
    }
  }
}

export const saveAs = () => async (dispatch, getState) => {
  const state = getState()
  const {directory: rootPath, application: packagerStatus} = state
  if (packagerStatus) {
    await dispatch(stopPackager())
  }
  await saveAllFiles(state, dispatch)
  request(_saveAsDialog(state.directory.rootPath)).then((resp) => {
    RecentProjectUtils.addProjectPath(resp.path)
    if (packagerStatus) {
      dispatch(runPackager(resp.path))
    }
    let resumeState = true
    request(_openProject(resp.path, resumeState))
  })
}
