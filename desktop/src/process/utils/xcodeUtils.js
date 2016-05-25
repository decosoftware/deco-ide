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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict'

const child_process = require('child_process')
const path = require('path')

import Logger from '../../log/logger'

function inferredSchemeName(xcodeProject) {
  return path.basename(xcodeProject.name, path.extname(xcodeProject.name))
}

function getAppPath(iosFolder, inferredSchemeName) {
  return path.join(iosFolder, `build/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`)
}

function getBundleID(appPath) {
  try {
    const bundleID = child_process.execFileSync(
      '/usr/libexec/PlistBuddy',
      ['-c', 'Print:CFBundleIdentifier', path.join(appPath, 'Info.plist')],
      {encoding: 'utf8'}
    ).trim()
    return bundleID
  } catch (e) {
    Logger.error(e)
  }
}

module.exports = {
  inferredSchemeName: inferredSchemeName,
  getAppPath: getAppPath,
  getBundleID: getBundleID,
}
