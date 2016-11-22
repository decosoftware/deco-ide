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

const path = require('path')
const autoUpdater = require('electron').autoUpdater
const dialog = require('electron').dialog

import {
  QUESTION,
} from './constants/DecoDialog'

const Logger = require('./log/logger')

class UpdateManager {
  constructor() {
    this._callback = null
  }

  init(version, platform) {
    if (global.__DEV__) {
      return
    }

    const betaFeedUrl = `http://ec2-54-191-131-104.us-west-2.compute.amazonaws.com:5014/update/${platform}/${version}/beta`
    // const stableFeedUrl = `https://deco-nuts.herokuapp.com/update?version=${version}&platform=${platform}`
    autoUpdater.setFeedURL(betaFeedUrl)
    autoUpdater.on('update-not-available', this._updateNotAvailable.bind(this))
    autoUpdater.on('update-downloaded', this._updateDownloaded.bind(this))
    autoUpdater.on('error', this._onError.bind(this))

    //Check for updates on start, but don't alert if no update is available
    this._checkForUpdateOnLaunch()
  }

  _checkForUpdateOnLaunch() {
    this._callback = (hasNewUpdate) => {
      if (hasNewUpdate) {
        return dialog.showMessageBox(QUESTION.shouldRestartAndUpdate) == 0
      }
      return false
    }

    autoUpdater.checkForUpdates()
  }

  checkForUpdates(callback) {
    if (global.__DEV__) {
      return
    }

    try {
      if (!callback) {
        return //must pass in a callback as argument
      }
      if (!this._callback) {
        this._callback = callback
      } else {
        dialog.showErrorBox('Update Status', 'An update check is already happening.')
        return
      }

      autoUpdater.checkForUpdates()
    } catch (e) {
      this._onError(e)
    }
  }

  _onError(error) {
    dialog.showErrorBox('Update Error', error.message || 'Failed to check update status.')
  }

  _updateNotAvailable() {
    if (this._callback) {
      this._callback(false)
    }
    this._callback = null
  }

  _updateDownloaded() {
    if (this._callback && this._callback(true)) {
      try {
        autoUpdater.quitAndInstall()
      } catch (e) {
        this._callback = null
        dialog.showErrorBox('Install Failure', 'Could not install the new update.')
      }
    }

    this._callback = null
  }
}

module.exports = new UpdateManager()
