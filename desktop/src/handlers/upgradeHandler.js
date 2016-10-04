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


import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import child_process from 'child_process'

import {
  app,
} from 'electron'

import {
  APP_SUPPORT,
  INTERNAL_LIB_FOLDER,
  EXTERNAL_LIB_FOLDER,
  LIB_PROJECT_FOLDER,
  TEMP_PROJECT_FOLDER_TEMPLATE,
} from '../constants/DecoPaths'
import bridge from '../bridge'
import {
  upgradeStatus,
} from '../actions/uiActions'

import Logger from '../log/logger'

const UPGRADE_FILE = path.join(INTERNAL_LIB_FOLDER, './Scripts/postinstall')
const VERSION_FILE_PATH = path.join(APP_SUPPORT, '.deco.version')

const ZIPPED_MODULES_NAME = 'modules.tar.bz2'
const INTERNAL_PROJECT_PATH = path.join(INTERNAL_LIB_FOLDER, 'Project')
const INTERNAL_MODULES_TAR_BZ2 = path.join(INTERNAL_LIB_FOLDER, 'modules.tar.bz2')
const EXTERNAL_MODULES_TAR_BZ2 = path.join(EXTERNAL_LIB_FOLDER, 'modules.tar.bz2')

function run(generatorFunction, resolve, reject) {
    var generatorItr = generatorFunction(resolve, reject, resume);
    function resume(callbackValue) {
      if (callbackValue) {
        generatorItr.throw(callbackValue)
      } else {
        generatorItr.next();
      }
    }
    generatorItr.next()
}

function removeProjectLib(resume) {
  try {
    fse.remove(LIB_PROJECT_FOLDER, () => resume())
  } catch (e) {
    Logger.error('Did not find an external project lib to remove during update')
  }
}

function copyInternalProjectToLib(resume) {
  fse.copy(INTERNAL_PROJECT_PATH, LIB_PROJECT_FOLDER, {clobber:true}, (err) => resume(err))
}

function removeModulesLib(resume) {
  try {
    fse.remove(EXTERNAL_MODULES_TAR_BZ2, () => resume())
  } catch (e) {
    Logger.error('Did not find an external modules.tar.bz2 to remove during update.')
  }
}

function copyZippedModulesToTemp(resume) {
  fse.copy(INTERNAL_MODULES_TAR_BZ2, TEMP_PROJECT_FOLDER_TEMPLATE, (err) => resume(err))
}

function unpackZippedModulesInTemp(resume) {
  const child = child_process.spawn('tar', ['-xf', ZIPPED_MODULES_NAME], {
    cwd: path.join(TEMP_PROJECT_FOLDER_TEMPLATE)
  })
  child.on('close', (code) => {
    let err = code != 0 ? 'unpack modules failed with non-zero exit code': null
    resume(err)
  })
}

function removeZippedModulesFromTemp(resume) {
  try {
    fse.remove(path.join(TEMP_PROJECT_FOLDER_TEMPLATE, ZIPPED_MODULES_NAME), () => resume())
  } catch (e) {
    Logger.error('Did not find a modules.tar.bz2 in temp.')
  }
}

function removeTempProject(resume) {
  try {
    fse.remove(TEMP_PROJECT_FOLDER_TEMPLATE, () => resume())
  } catch (e) {
    Logger.error('Did not find a temp project folder to remove during update.')
  }
}

function copyProjectLibToTemp(resume) {
  fse.copy(LIB_PROJECT_FOLDER, TEMP_PROJECT_FOLDER_TEMPLATE, {clobber: true}, (err) => resume(err))
}

function writeUpdatedVersionFile(resume) {
  fs.writeFile(VERSION_FILE_PATH, app.getVersion(), (err) => resume(err))
}

const upgradeChain = [
  removeProjectLib,
  copyInternalProjectToLib,
  removeModulesLib,
  removeTempProject,
  copyProjectLibToTemp,
  copyZippedModulesToTemp,
  unpackZippedModulesInTemp,
  removeZippedModulesFromTemp
  writeUpdatedVersionFile,
]

function* asyncUpgrade(resolve, reject, resume) {
  try {
    for(const fn of upgradeChain) {
      yield fn(resume)
    }
  } catch (e) {
    Logger.error(`upgrade error: ${e}`)
    bridge.send(upgradeStatus('failed'))
    reject(e)
  }
  resolve()
  bridge.send(upgradeStatus('success'))
}

class UpgradeHandler {
  needsUpgrade() {
    try {
      const lastVersion = fs.readFileSync(VERSION_FILE_PATH).toString()
      return lastVersion != app.getVersion()
    } catch (e) {
      //this behavior is mostly expected, but we'll keep it in local logs for debugging
      Logger.info(e)
      return true
    }
  }

  upgrade() {
    return new Promise((resolve, reject) => {
      try {
        run(asyncUpgrade, resolve, reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

const handler = new UpgradeHandler()
export default handler
