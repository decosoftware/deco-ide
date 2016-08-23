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

const FileSystem = require('../fs/fileSystem.js')
const Logger = require('../log/logger')

const ROOT_FOLDER = '/com.decosoftware.Deco'
const PROJECT_ROOT_FOLDER = '/com.decosoftware.Deco/ProjectInfo'
const LIB_FOLDER = '/com.decosoftware.Deco/libs'
const BINARIES_FOLDER = '/com.decosoftware.Deco/libs/binaries'
const COMPONENT_CACHE_FOLDER = '/com.decosoftware.Deco/cache'
const TEMP_PROJECT_FOLDER = '/.Deco/tmp/Project'
const TEMP_PROJECT_FOLDER_TEMPLATE = '/.Deco/tmp/.template.Project'
const LIB_PROJECT_FOLDER = '/com.decosoftware.Deco/libs/Project'
const PUBLIC_FOLDER = path.join(__dirname, '../../public')

module.exports = {
  RelativePaths: {
    ROOT_FOLDER: ROOT_FOLDER,
    PROJECT_ROOT_FOLDER: PROJECT_ROOT_FOLDER,
    LIB_FOLDER: LIB_FOLDER,
    BINARIES_FOLDER: BINARIES_FOLDER,
    COMPONENT_CACHE_FOLDER: COMPONENT_CACHE_FOLDER,
  },
  PUBLIC_FOLDER: PUBLIC_FOLDER,
  APP_SUPPORT: FileSystem.getAppPath(ROOT_FOLDER),
  LIB_FOLDER: FileSystem.getAppPath(LIB_FOLDER),
  BINARIES_FOLDER: FileSystem.getAppPath(BINARIES_FOLDER),
  TMP_FOLDER: FileSystem.getTmpPath(ROOT_FOLDER),
  CACHE_FOLDER: FileSystem.getAppPath(COMPONENT_CACHE_FOLDER),
  TEMP_PROJECT_FOLDER: FileSystem.getHomePath(TEMP_PROJECT_FOLDER),
  LIB_PROJECT_FOLDER: FileSystem.getAppPath(LIB_PROJECT_FOLDER),
  TEMP_PROJECT_FOLDER_TEMPLATE: FileSystem.getHomePath(TEMP_PROJECT_FOLDER_TEMPLATE),
}
