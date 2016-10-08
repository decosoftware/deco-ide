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

"use strict"

//Electron requires
import {
  app,
  dialog,
  shell
} from 'electron'

import path from 'path'

//Deco Requires
import WindowManager from '../window/windowManager'
import UpdateManager from '../updateManager'

import windowHandler from '../handlers/windowHandler'
import projectHandler from '../handlers/projectHandler'
import fileHandler from '../handlers/fileHandler'
import processHandler from '../handlers/processHandler'

import PackagerController from '../process/packagerController'
import SimulatorController from '../process/simulatorController'
import BuildController from '../process/buildController'
import taskLauncher from '../process/taskLauncher'

import {
  INFO,
  QUESTION,
} from '../constants/DecoDialog'


import ErrorConstants from 'shared/constants/ipc/ErrorConstants'
const { ERROR, } = ErrorConstants

import bridge from '../bridge'
import {
  shouldCreateProject,
  shouldSaveProjectAs,
  shouldSaveProject,
  openProjectDialog,
  toggleTerm,
  shouldCloseTab,
  openInstallModuleDialog,
  openImportTemplateDialog,
  openFile,
} from '../actions/acceleratorActions'

import {
  updatePackagerStatus,
} from '../actions/processActions'

import {
  openProjectSettings,
} from '../actions/projectActions'

const Logger = require('../log/logger')

const TemplateBuilder = function(platform) {

  this.fileMenu = {
    label: 'File',
    submenu: [{
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (WindowManager.allWindowsClosed()) {
          WindowManager.newWindow(640, 450, false).then(() => {
            bridge.send(shouldCreateProject())
          })
          WindowManager.initializePreferencesWindow()
        } else {
          if (WindowManager.userWantsToClose()) {
            bridge.send(shouldCreateProject())
          }
        }
      },
    },{
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click: () => {
        if (WindowManager.allWindowsClosed()) {
          WindowManager.newWindow(640, 450, false).then(() => {
            bridge.send(openProjectDialog())
          })
          WindowManager.initializePreferencesWindow()
        } else {
          if (WindowManager.userWantsToClose()) {
            bridge.send(openProjectDialog())
          }
        }
      },
    },{
      type: 'separator'
    },{
      label: 'Save Project',
      accelerator: 'CmdOrCtrl+S',
      click: () => {
        bridge.send(shouldSaveProject())
      },
    }, {
      label: 'Save Project As...',
      accelerator: 'Shift+CmdOrCtrl+S',
      click: () => {
        bridge.send(shouldSaveProjectAs())
      },
    },]
  }
  this.editMenu = {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }, ]
  }

  this.installMenu = {
    label: 'Install',
    submenu: [{
      label: 'Install npm module',
      accelerator: 'CmdOrCtrl+Shift+M',
      click: () => {
        bridge.send(openInstallModuleDialog())
      },
    }, {
      type: 'separator'
    }, {
      label: 'Add deco config to project',
      click: () => {
        const task = taskLauncher.runTask('init-template')
        task.on('exit', () => {
          const root = fileHandler.getWatchedPath()
          bridge.send(openFile(path.join(root, 'configure.deco.js')))
        })
      },
    }, ],
  }

  this.windowMenu = {
    label: 'Window',
    role: 'window',
    submenu: [{
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: 'Close Tab',
      accelerator: 'CmdOrCtrl+W',
      click: function() {
        if (global.preferencesWindow) {
          if (global.preferencesWindow.isFocused()) {
            WindowManager.hidePreferencesWindow()
            return
          }
        }
        bridge.send(shouldCloseTab())
      }
    }, {
      type: 'separator'
    }, {
      label: 'Bring All to Front',
      role: 'front'
    }, ]
  }

  this.helpMenu = {
    label: 'Help',
    role: 'help',
    submenu: [{
      label: 'Chat With Deco Team...',
      click: function() {
        shell.openExternal(
          'https://decoslack.slack.com/messages/deco/'
        )
      }
    }, ]
  }

  this.appMenu = null
  if (platform == 'darwin') {
    this.appMenu = {
      label: 'Deco',
      submenu: [{
        label: 'About Deco',
        role: 'about'
      }, {
        label: 'Check for Update',
        click: function() {
          try {
            UpdateManager.checkForUpdates((hasUpdate) => {
              if (hasUpdate) {
                return dialog.showMessageBox(QUESTION.shouldRestartAndUpdate) == 0
              }
              dialog.showMessageBox(INFO.noUpdateIsAvailable)
              return false
            })
          } catch (e) {
            Logger.error(e)
          }
        }
      }, {
        type: 'separator'
      }, {
        label: 'Preferences...',
        accelerator: 'Command+,',
        click: function() {
          WindowManager.openPreferencesWindow()
        }
      }, {
        label: 'Project Settings',
        click: function() {
          const root = fileHandler.getWatchedPath()
          //in case this is clicked before a project is open
          if (!root || root == '') return

          projectHandler.createProjectSettingsTemplate(root)
            .then((settingsPath) => {
              //TODO make a call to web to open this file
              bridge.send(openProjectSettings(settingsPath))
            })
        }
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide Deco',
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      }, {
        label: 'Show All',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          if (WindowManager.allWindowsClosed() || WindowManager.userWantsToClose()) {
            app.exit(0)
          }
        }
      }, ]
    }
  }

  this.toolsMenu = {
    label: 'Tools',
    submenu: [{
      label: 'Restart Packager',
      click: function() {
        PackagerController.runPackager(null)
      }
    }, {
      type: 'separator',
    }, {
      label: 'Build Native Modules',
      accelerator: 'Command+B',
      click: function() {
        BuildController.buildIOS()
      }
    }, {
      label: 'Clean',
      accelerator: 'CommandOrCtrl+Alt+K',
      click: function() {
        try {
          const root = fileHandler.getWatchedPath()
          if (root) {
            projectHandler.cleanBuildDir(root)
          }
        } catch (e) {
          Logger.error(e)
        }
      },
    }, {
      type: 'separator'
    }, {
      label: 'Run/Reload Simulator',
      accelerator: 'CmdOrCtrl+R',
      click: function() {
        processHandler.onHardReloadSimulator({}, (response) => {
          if (response.type == ERROR) {
            Logger.error(response.message)
          }
        })
      }
    }, ]
  }

  if (global.__DEV__) {
    this.toolsMenu.submenu.push({
      type: 'separator'
    })
    this.toolsMenu.submenu.push({
      label: 'Reload Last Save',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: function(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.reload()
        }
      }
    })
  }

  this.viewMenu = {
    label: 'View',
    submenu: [{
      label: 'Toggle Full Screen',
      accelerator: (function() {
        if (process.platform == 'darwin')
          return 'Ctrl+Command+F'
        else
          return 'F11'
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }, {
      label: 'Toggle Packager Output',
      accelerator: (function() {
        if (process.platform == 'darwin') {
          return 'Ctrl+Command+J'
        } else {
          return 'F10'
        }
      })(),
      click: function() {
        bridge.send(toggleTerm())
      }
    }, ]
  }

  //TURN ON DEVELOPER TOOLS WHEN IN DEV MODE
  if (global.__DEV__) {
    this.viewMenu.submenu.push({
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Alt+Command+I'
            else
              return 'Ctrl+Shift+I'
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.toggleDevTools()
          }
        })
  }
}

TemplateBuilder.prototype.makeTemplate = function() {

  var template = []
  if (this.appMenu) {
    template.push(this.appMenu)
  }
  template.push(this.fileMenu)
  template.push(this.editMenu)
  template.push(this.viewMenu)
  template.push(this.installMenu)
  template.push(this.toolsMenu)
  template.push(this.windowMenu)
  template.push(this.helpMenu)

  return template
}

module.exports = TemplateBuilder
