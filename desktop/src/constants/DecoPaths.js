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
import { app } from 'electron'

const getPath = function(pathType, relativePath) {
  const userPath = app.getPath(pathType)
  return path.join(userPath, relativePath)
}
const getAppPath = getPath.bind(null, 'appData');
const getTmpPath = getPath.bind(null, 'temp');
const getHomePath = getPath.bind(null, 'home');

const Logger = require('../log/logger')

const ROOT_FOLDER = '/com.decosoftware.Deco'
const LIB_FOLDER = '/com.decosoftware.Deco/libs'
const BINARIES_FOLDER = '/com.decosoftware.Deco/libs/binaries'
const COMPONENT_CACHE_FOLDER = '/com.decosoftware.Deco/cache'
const TEMP_PROJECT_FOLDER = '/.Deco/tmp/Project'
const TEMP_PROJECT_FOLDER_TEMPLATE = '/.Deco/tmp/.template.Project'
const LIB_PROJECT_FOLDER = '/com.decosoftware.Deco/libs/Project'
const PUBLIC_FOLDER = path.join(__dirname, '../../public')
const UNPACK_FOLDER = path.join(__dirname, '../../libs')

module.exports = {
  PUBLIC_FOLDER,
  UNPACK_FOLDER,
  APP_SUPPORT: getAppPath(ROOT_FOLDER),
  LIB_FOLDER: getAppPath(LIB_FOLDER),
  BINARIES_FOLDER: path.join(UNPACK_FOLDER, '/binaries'),
  TMP_FOLDER: getTmpPath(ROOT_FOLDER),
  CACHE_FOLDER: getAppPath(COMPONENT_CACHE_FOLDER),
  LIB_PROJECT_FOLDER: getAppPath(LIB_PROJECT_FOLDER),
  TEMP_PROJECT_FOLDER: getHomePath(TEMP_PROJECT_FOLDER),
  TEMP_PROJECT_FOLDER_TEMPLATE: getHomePath(TEMP_PROJECT_FOLDER_TEMPLATE),
}
