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
} from '../constants/DecoPaths'

import bridge from '../bridge'
import {
  upgradeStatus,
} from '../actions/uiActions'

import Logger from '../log/logger'

const UPGRADE_FILE = path.join(INTERNAL_LIB_FOLDER, './Scripts/upgrade.sh')
const VERSION_FILE_PATH = path.join(APP_SUPPORT, '.deco.version')

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
        child_process.exec(
          `${UPGRADE_FILE} "${INTERNAL_LIB_FOLDER}" ${app.getVersion()}`, (error) => {
            if (error) {
              Logger.error(`upgrade error: ${error}`)
              bridge.send(upgradeStatus('failed'))
              reject(error)
            } else {
              bridge.send(upgradeStatus('success'))
              resolve()
            }
          })
      } catch (e) {
        reject(e)
      }
    })
  }
}

const handler = new UpgradeHandler()
export default handler
