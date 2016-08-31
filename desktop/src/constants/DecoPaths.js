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

// top dir of app data folder ~/Library/Application Support/
const ROOT_FOLDER = '/com.decosoftware.Deco'
// holds Project skeleton and modules.tar.gz
const EXTERNAL_LIB_FOLDER = '/com.decosoftware.Deco/libs'
// used by component handler
const COMPONENT_CACHE_FOLDER = '/com.decosoftware.Deco/cache'
// temp project that will be opened on create new
const TEMP_PROJECT_FOLDER = '/.Deco/tmp/Project'
// temp project template that will replace old temp project listed above
const TEMP_PROJECT_FOLDER_TEMPLATE = '/.Deco/tmp/.template.Project'
// external path to the Project template that is copied into temp dir
const LIB_PROJECT_FOLDER = '/com.decosoftware.Deco/libs/Project'
// public folder to load in bundled web src
const PUBLIC_FOLDER = path.join(__dirname, '../../public')
// internal libraries used by Deco (includes whatever is in the desktop/libs folder)
const INTERNAL_LIB_FOLDER = path.join(__dirname, '../../libs')
// node binaries to add into path
const NODE_BINARIES = path.join(INTERNAL_LIB_FOLDER, 'node', 'bin')

module.exports = {
  PUBLIC_FOLDER,
  INTERNAL_LIB_FOLDER,
  NODE_BINARIES,
  APP_SUPPORT: getAppPath(ROOT_FOLDER),
  EXTERNAL_LIB_FOLDER: getAppPath(EXTERNAL_LIB_FOLDER),
  TMP_FOLDER: getTmpPath(ROOT_FOLDER),
  CACHE_FOLDER: getAppPath(COMPONENT_CACHE_FOLDER),
  LIB_PROJECT_FOLDER: getAppPath(LIB_PROJECT_FOLDER),
  TEMP_PROJECT_FOLDER: getHomePath(TEMP_PROJECT_FOLDER),
  TEMP_PROJECT_FOLDER_TEMPLATE: getHomePath(TEMP_PROJECT_FOLDER_TEMPLATE),
}
