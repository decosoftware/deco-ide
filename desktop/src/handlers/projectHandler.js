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

import fs from 'fs'
import path from 'path'
import child_process from 'child_process'

import fs_plus from 'fs-plus'
import _ from 'lodash'

import bridge from '../bridge'
import {
  onError,
  onSuccess,
} from '../actions/genericActions'
import {
  setProject,
} from '../actions/projectActions'
import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  CREATE_NEW_PROJECT,
  OPEN_PROJECT,
  SHARE_SAVE_STATUS,
} = ProjectConstants

import {
  TEMP_PROJECT_FOLDER,
  TEMP_PROJECT_FOLDER_TEMPLATE,
  LIB_PROJECT_FOLDER,
} from '../constants/DecoPaths'

import SimulatorController from '../process/simulatorController'
import PackagerController from '../process/packagerController'

import Logger from '../log/logger'

let unsavedMap = {}

class ProjectHandler {

  hasUnsavedProgress() {
    return _.keys(unsavedMap).length != 0
  }

  register() {
    bridge.on(CREATE_NEW_PROJECT, this.createNewProject.bind(this))
    bridge.on(OPEN_PROJECT, this.openProject.bind(this))
    bridge.on(SHARE_SAVE_STATUS, this.updateSaveStatus.bind(this))
  }

  updateSaveStatus(payload, respond) {
    try {
      if (payload.status) {
        unsavedMap[payload.id] = payload.status
      } else {
        delete unsavedMap[payload.id]
      }
    } catch(e) {
      Logger.error(e)
    }
    respond(onSuccess(SHARE_SAVE_STATUS))
  }

  _deleteProject(root) {
    const deletePath = root + '.delete'
    try {
      fs.statSync(root)
    } catch(e) {
      // Trying to delete a project that does not exist eh?
      Logger.error(e)
      return
    }
    try {
      fs_plus.moveSync(root, deletePath)
      child_process.spawn('rm', ['-rf', deletePath, ])
    } catch(e) {
      Logger.error(e)
    }
  }

  cleanBuildDir(root) {
    try {
      const pathsToClean = [
        path.join(root, 'ios/build/ModuleCache'),
        path.join(root, 'ios/build/info.plist'),
        path.join(root, 'ios/build/Build/Intermediates'),
      ]
      _.each(pathsToClean, (filename) => {
        child_process.spawn('rm', ['-rf', filename, ])
      })
    } catch (e) {
      Logger.error(e)
    }
  }

  _createTemplateFolder() {
    return new Promise((resolve, reject) => {
      try {
        child_process.spawn('cp', ['-rf', path.join(LIB_PROJECT_FOLDER), TEMP_PROJECT_FOLDER_TEMPLATE])
        .on('close', (code) => {
          if (code != 0) {
            Logger.error(`Project template creation exited with code: ${code}`)
            reject()
          } else {
            resolve()
          }
        })
      } catch (e) {
        Logger.error(e)
        return
      }
    })
  }

  _resetProcessState() {
    try {
      SimulatorController.clearLastSimulator()
      PackagerController.killPackager()
    } catch (e) {
      Logger.error(e)
    }
  }

  createNewProject(payload, respond) {
    this._resetProcessState()
    try {
      payload.path = TEMP_PROJECT_FOLDER
      this._deleteProject(payload.path)
      const createProj = () => {
        fs.rename(TEMP_PROJECT_FOLDER_TEMPLATE, TEMP_PROJECT_FOLDER, (err) => {
          if (err) {
            Logger.error(err)
            respond(onError(err))
            return
          }
          respond(onSuccess(CREATE_NEW_PROJECT))
          bridge.send(setProject(payload.path, payload.tmp))
          this._createTemplateFolder()
        })
        unsavedMap = {}
      }

      try {
        fs.statSync(TEMP_PROJECT_FOLDER_TEMPLATE)
      } catch (e) {
        this._createTemplateFolder().then(() => {
          createProj()
        })
        return
      }
      createProj()

    } catch (e) {
      Logger.error(e)
    }
  }

  openProject(payload, respond) {
    if (!payload.resumeState) {
      this._resetProcessState()
    }
    unsavedMap = {}
    bridge.send(setProject(payload.path, false))
    respond(onSuccess(OPEN_PROJECT))
  }
}

const handler = new ProjectHandler()
export default handler
