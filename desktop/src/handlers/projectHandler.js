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
import mv from 'mv'
import mkdirp from 'mkdirp'

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

const PROJECT_SETTINGS_TEMPLATE =`{

  // relative path from project root to the .app binary that is generated after building iOS
  "iosTarget": "ios/build/Build/Products/Debug-iphonesimulator/Project.app",

  // relative path from project root to the xcode project or workspace file for iOS build
  "iosProject": "ios/Project.xcodeproj",

  // scheme name to use when building in Deco
  "iosBuildScheme": "Project",

  // relative path from project to the AndroidManifest.xml file for your application
  "androidManifest": "android/app/src/main/AndroidManifest.xml",

  // port for the packager to run on
  "packagerPort": 8081
}`

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
          this.createProjectSettingsTemplate(payload.path)
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

  createProjectSettingsTemplate(rootPath) {
    return new Promise((resolve, reject) => {
      const metadataPath = path.join(rootPath, '.deco')
      const settingsFilePath = path.join(metadataPath, '.settings')
      try {
        fs.statSync(settingsFilePath)
        resolve(settingsFilePath)
      } catch (e) {
        if (e && e.code == 'ENOENT') {
          mkdirp(metadataPath, () => {
            try {
              fs.writeFileSync(settingsFilePath, PROJECT_SETTINGS_TEMPLATE, {
                mode: '755'
              })
              resolve(settingsFilePath)
            } catch (e) {
              //could not write out the file
              Logger.error('Failed to write settings file template', e)
              reject()
            }
          })
        } else {
          Logger.error(e)
          reject()
        }
      }
    })
  }

  /**
   * Backwards compatability!
   */
  updateOldProjectStructure(rootPath) {
    const oldMetadata = path.join(rootPath, '.deco')
    const list = fs.readdirSync(oldMetadata)
    _.each(list, (sub) => {
      const oldPath = path.join(oldMetadata, sub)
      const newPath = path.join(oldMetadata, 'metadata', sub)
      mv(oldPath, newPath, {mkdirp: true}, (err) => {
        if (err) {
          Logger.error(err)
        }
      })
    })
    // add .settings file
    this.createProjectSettingsTemplate(rootPath)
  }

  /**
   * Backwards compatability!
   */
  checkOldProjectStructure(rootPath) {
    const oldMetadataPath = path.join(rootPath, '.deco')
    const newMetadataPath = path.join(oldMetadataPath, 'metadata')
    fs.stat(oldMetadataPath, (err, stats) => {
      if (err) {
        //project is clean
        this.createProjectSettingsTemplate(rootPath)
        return
      }

      fs.stat(newMetadataPath, (err, stats) => {
        if (!err) {
          this.createProjectSettingsTemplate(rootPath)
          return //project is current
        }
        if (err.code == 'ENOENT') {
          //this is an old project structure
          this.updateOldProjectStructure(rootPath)
        } else {
          Logger.error(err)
          return //something went wrong
        }
      })
    })
  }

  openProject(payload, respond) {
    if (!payload.resumeState) {
      this._resetProcessState()
    }
    unsavedMap = {}
    bridge.send(setProject(payload.path, false))
    this.checkOldProjectStructure(payload.path)
    respond(onSuccess(OPEN_PROJECT))
  }
}

const handler = new ProjectHandler()
export default handler
