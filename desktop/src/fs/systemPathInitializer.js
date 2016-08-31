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

import fs from 'fs'
import child_process from 'child_process'
import path from 'path'
import mkdirp from 'mkdirp'

import Logger from '../log/logger'

import {
  TMP_FOLDER,
  CACHE_FOLDER,
  TEMP_PROJECT_FOLDER,
} from '../constants/DecoPaths'


var errFunc = function(err) {
  if (err) {
    Logger.error('System paths failed to init properly!', err)
  }
}

class SystemPathInitializer {
  static init() {
    try {
      fs.statSync(CACHE_FOLDER)
    } catch (e) {
      try {
        fs.mkdir(CACHE_FOLDER, '775', errFunc)
      } catch (e) {
        Logger.error('Could not make the component cache folder.', e)
      }
    }
  }
}

export default SystemPathInitializer
