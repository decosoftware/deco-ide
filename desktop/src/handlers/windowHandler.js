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

import path from 'path'
import child_process from 'child_process'

import Electron, {
  dialog,
  BrowserWindow,
} from 'electron'
import fs from 'fs-plus'

import FileSystem from '../fs/fileSystem'
import bridge from '../bridge'
import {
  openProjectDialog,
  saveAsDialog,
  openPathChooserDialog,
} from '../actions/windowActions'
import {
  onSuccess,
  onError,
} from '../actions/genericActions'
import WindowConstants from 'shared/constants/ipc/WindowConstants'
const {
  OPEN_PROJECT_DIALOG,
  SAVE_AS_DIALOG,
  RESIZE,
  OPEN_PATH_CHOOSER_DIALOG,
} = WindowConstants

import Logger from '../log/logger'

class WindowHandler {
  register() {
    bridge.on(OPEN_PROJECT_DIALOG, this.openProjectDialog.bind(this))
    bridge.on(SAVE_AS_DIALOG, this.saveAsDialog.bind(this))
    bridge.on(RESIZE, this.resizeWindow.bind(this))
    bridge.on(OPEN_PATH_CHOOSER_DIALOG, this.openPathChooserDialog.bind(this))
  }

  openProjectDialog(payload, respond) {
    var selectedPaths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      title: 'Select Project Directory',
      properties: ['openDirectory'],
      filter: [
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (! selectedPaths || selectedPaths.length === 0) {
      return
    }

    respond(openProjectDialog(selectedPaths[0]))
  }

  openPathChooserDialog(payload, respond) {
    if (!payload.propertyType) payload.propertyType = 'openDirectory'
    var selectedPaths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      title: payload.title || 'Select Path',
      properties: [payload.propertyType],
      filter: [
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (! selectedPaths || selectedPaths.length === 0) {
      return
    }

    respond(openPathChooserDialog(selectedPaths[0]))
  }

  _cleanBuildDirectory(projectPath) {
    const buildDir = path.join(projectPath, 'ios/build')

    const logsPath = path.join(buildDir, 'Logs')
    const moduleCache = path.join(buildDir, 'ModuleCache')
    const infoPlist = path.join(buildDir, 'info.plist')
    const buildIntermediates = path.join(buildDir, 'Build/Intermediates')

    child_process.spawn('rm', ['-rf', logsPath])
    child_process.spawn('rm', ['-rf', moduleCache])
    child_process.spawn('rm', ['-rf', infoPlist])
    child_process.spawn('rm', ['-rf', buildIntermediates])
  }

  saveAsDialog(payload, respond) {
    try {
      const currentPath = payload.rootPath
      var projectPath = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        title: 'Select a directory to save your project'
      })

      //This likely means no path was specified
      if (!projectPath) {
        return
      }

      if (fs.existsSync(projectPath)) {
        if (projectPath == currentPath) {
          respond(saveAsDialog(projectPath))
          return
        }
        child_process.spawnSync('rm', ['-rf', projectPath])
      }

      const child = child_process.spawnSync('cp', ['-rf', currentPath, projectPath,])

      // We should clean build directories cache, since the path names will have changed
      this._cleanBuildDirectory(projectPath)

      respond(saveAsDialog(projectPath))
    } catch (e) {
      Logger.error(e)
      respond(onError(SAVE_AS_DIALOG))
    }
  }

  resizeWindow(payload, respond, event) {
    try {
      const WINDOW_SIZE = Electron.screen.getPrimaryDisplay().workAreaSize
      const mainWindow = BrowserWindow.fromWebContents(event.sender)

      if (payload.width && payload.height) {
        mainWindow.setSize(payload.width, payload.height);
        if (payload.center) {
          mainWindow.center()
        } else if ((typeof payload.x === 'number') &&
            (typeof payload.y === 'number') && payload.x >= 0 && payload.y >= 0) {
          mainWindow.setPosition(payload.x, payload.y)
        }
        if (payload.popResize) {
          mainWindow.hide();
          setTimeout(function() {
            mainWindow.show();
          }, 500);
        }
      } else if (payload.twoThirds) {
        mainWindow.setPosition(0, 0);
        mainWindow.setSize(Math.round(WINDOW_SIZE.width/1.3), Math.round(WINDOW_SIZE.height))

      } else if (payload.maximize) {
        mainWindow.setPosition(0, 0);
        mainWindow.maximize();

      } else {
        Logger.error('resize-window was given incorrect arguments');
      }
      respond(onSuccess(RESIZE))
    } catch (e) {
      Logger.error(e)
      respond(onError(RESIZE))
    }
  }
}

const handler = new WindowHandler()
export default handler
