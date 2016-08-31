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

import child_process from 'child_process'
import path from 'path'

import _ from 'lodash'

import Electron, {
  dialog,
  BrowserWindow,
} from 'electron'

import bridge from '../bridge'
import { customConfigError } from '../actions/projectActions'
import fileHandler from '../handlers/fileHandler'
import preferenceHandler from '../handlers/preferenceHandler'

import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

import {
  INTERNAL_LIB_FOLDER,
  NODE_BINARIES,
} from '../constants/DecoPaths'

const TASK_RUNNER = './Scripts/deco-tool/bin/deco-tool'
const FORK_TASK_RUNNER = './Scripts/deco-tool/index'

const launchCustomTaskErrorDialog = (text) => {
  bridge.send(customConfigError(text))
}

import Logger from '../log/logger'

const closeTask = (task) => {
  if (task) {
    try {
      if (!task.killed) {
        task.kill('SIGINT')
      }
    } catch (e) {
      task = null
    }
  }
}

const taskList = []
process.on('SIGINT', () => {
  taskList.forEach((task) => {
    closeTask(task)
  })
})
process.on('close', () => {
  taskList.forEach((task) => {
    closeTask(task)
  })
})
process.on('exit', () => {
  taskList.forEach((task) => {
    closeTask(task)
  })
})

const injectOptionsFromPreferences = (options) => {
  const preferences = preferenceHandler.getPreferences()
  const androidHome = preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.ANDROID_HOME]
  const genymotionApp = preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.GENYMOTION_APP]
  if (androidHome == '') {
    Logger.info('Path to Android SDK is not set, android functionality may be broken as a result')
    return //just not worth it
  }
  options.env.ANDROID_HOME = androidHome
  options.env.GENYMOTION_APP = genymotionApp
  options.env.PATH = `${options.env.PATH}:${path.join(androidHome, 'tools')}:${path.join(androidHome, 'platform-tools')}`
  if (preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.USE_GENYMOTION]) {
    options.env.USE_GENYMOTION = preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.USE_GENYMOTION]
  }

  options.env.PATH = `${options.env.PATH}:${NODE_BINARIES}`
}

class TaskLauncher {
  static objToArgString(obj) {
    const args = []
    _.each(obj, (val, key) => {
      args.push(`--${key}`)
      args.push(val.toString())
    })
    return args
  }

  /**
   * Since this is a fork, the task should manage its children.
   * (Children of forked tasks may not close even after the forked task is killed)
   */
  static runManagedTask(taskname, args, options, cb) {
    if (!options) options = {}
    options.env = Object.assign({}, options.env || {}, process.env)
    injectOptionsFromPreferences(options)

    if (!args) {
      args = []
    }

    const PROJECT_PATH = fileHandler.getWatchedPath()
    const task = child_process.fork(FORK_TASK_RUNNER, [taskname, '-r', PROJECT_PATH].concat(args), Object.assign({} , options, {
      cwd: INTERNAL_LIB_FOLDER,
    }))

    taskList.push(task)
    task.once('message', (obj) => {
      if (obj._configError) {
        launchCustomTaskErrorDialog(obj.errorMessage)
        return
      }
      if (cb) {
        cb(obj)
      }
    })
  }

  static runTask(taskname, args, options) {
    if (!options) options = {}
    options.env = Object.assign({}, options.env || {}, process.env)
    injectOptionsFromPreferences(options)

    if (!args) {
      args = []
    }

    const PROJECT_PATH = fileHandler.getWatchedPath()
    const task = child_process.spawn(TASK_RUNNER, [taskname, '-r', PROJECT_PATH].concat(args), Object.assign({} , options, {
      cwd: INTERNAL_LIB_FOLDER,
    }))

    let errors = ''

    task.stderr.on('data', (data) => {
      try {
        var plainTextData = data.toString()
        errors += plainTextData
      } catch (e) {
        Logger.error(e)
      }
    })

    task.once('exit', (code, signal) => {
      if (code == 1) {
        launchCustomTaskErrorDialog(errors)
      }
    })

    taskList.push(task)

    return task
  }
}

export default TaskLauncher
