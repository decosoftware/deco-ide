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
import path from 'path'
import child_process from 'child_process'

import {
  app,
} from 'electron'

import {
  APP_SUPPORT,
} from '../constants/DecoPaths'
import bridge from '../bridge'
import {
  upgradeStatus,
} from '../actions/uiActions'

import Logger from '../log/logger'

const UPGRADE_FILE = global.__DEV__ ? path.join(__dirname, '../Scripts/postinstall') : path.join(__dirname, '../../app.asar.unpacked/Scripts/postinstall')
const DECO_SUDO = path.join(APP_SUPPORT, '/libs/binaries/Deco')
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
  _upgrade(resolve, reject) {
    const opts = global.__DEV__ ? `dev ${path.join(__dirname, '../deco_unpack_lib')}` : 'upgrade'
    const command = `\"${UPGRADE_FILE}\" ${opts}`
    const execString = `do shell script \\\"${command}\\\" with administrator privileges`
    child_process.exec(`\"${DECO_SUDO}\" -e "${execString}"`, {env: process.env}, (err, stdout, stderr) => {
      if (err !== null) {
        Logger.error(`upgrade stderr: ${stderr}`)
        Logger.error(`upgrade error: ${err}`)
        bridge.send(upgradeStatus('failed'))
        reject()
        return
      }
      try {
        bridge.send(upgradeStatus('success'))
        resolve()
      } catch (e) {
        Logger.error(e)
        bridge.send(upgradeStatus('failed'))
        reject()
      }
    })
  }
  upgrade() {
    return new Promise(this._upgrade.bind(this))
  }
}

const handler = new UpgradeHandler()
export default handler
