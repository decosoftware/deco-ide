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
 *
 */
'use strict'

const path = require('path')

function findXcodeProject(files) {
  const sortedFiles = files.sort()
  for (let i = sortedFiles.length - 1; i >= 0; i--) {
    const fileName = files[i]
    const ext = path.extname(fileName)

    if (ext === '.xcworkspace') {
      return {
        name: fileName,        
        isWorkspace: true,
      }
    }
    if (ext === '.xcodeproj') {
      return {
        name: fileName,
        isWorkspace: false,
      }
    }
  }

  return null
}

module.exports = findXcodeProject
