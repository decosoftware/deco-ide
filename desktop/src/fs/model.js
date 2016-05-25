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

"use strict";

var FileSystem = require('./fileSystem.js');
var fs = require('fs');
var mkdirp = require('mkdirp');
var child_process  = require('child_process');
var path = require('path');

let Logger = require('../log/logger.js');

var DecoPaths = require('../constants/DecoPaths');
var RelativePaths = DecoPaths.RelativePaths;

//Models
var ROOT_FOLDER = RelativePaths.ROOT_FOLDER;
var PROJECT_ROOT_FOLDER = RelativePaths.PROJECT_ROOT_FOLDER;
var LIB_FOLDER = RelativePaths.LIB_FOLDER;
var BINARIES_FOLDER = RelativePaths.BINARIES_FOLDER;
var COMPONENT_CACHE_FOLDER = RelativePaths.COMPONENT_CACHE_FOLDER;
var TEMP_PROJECT_FOLDER = DecoPaths.TEMP_PROJECT_FOLDER;


var errFunc = function(err) {
  if (err) {
    Logger.error('Model failed to init', err)
  }
}

var init = function () {
  try {
    FileSystem.statAppData(PROJECT_ROOT_FOLDER)
  } catch (e) {
    FileSystem.createAppDataDirectory(PROJECT_ROOT_FOLDER, errFunc)
  }

  try {
    FileSystem.statAppData(COMPONENT_CACHE_FOLDER)
  } catch (e) {
    FileSystem.createAppDataDirectory(COMPONENT_CACHE_FOLDER, errFunc)
  }

  try {
    FileSystem.statTmpData(ROOT_FOLDER)
  } catch (e) {
    FileSystem.createTmpDataDirectory(ROOT_FOLDER, errFunc)
  }

  try {
    FileSystem.statTmpData(path.join(ROOT_FOLDER, 'projects'))
  } catch (e) {
    FileSystem.createTmpDataDirectory(path.join(ROOT_FOLDER, 'projects'),errFunc)
  }

  try {
    fs.statSync(TEMP_PROJECT_FOLDER)
    fs.statSync(path.join(TEMP_PROJECT_FOLDER, 'node_modules'))
    fs.statSync(path.join(TEMP_PROJECT_FOLDER, '/ios'))
  } catch (e) {
    mkdirp(TEMP_PROJECT_FOLDER, function(err) {
      if (err) {
        Logger.error('Model failed to init', err)
        return
      }
      var projectPath = path.join(FileSystem.getAppPath(LIB_FOLDER), '/ios/Project/ios')
      var modulePath = path.join(FileSystem.getAppPath(LIB_FOLDER), 'node_modules')
      try {
        child_process.spawnSync('cp', ['-rf', projectPath, TEMP_PROJECT_FOLDER])
        child_process.spawnSync('cp', ['-rf', modulePath, TEMP_PROJECT_FOLDER])
      } catch (e) {
        Logger.error('Failed to copy modules')
      }
    })
  }
};

module.exports = {
  init: init,
  LIB_FOLDER: FileSystem.getAppPath(LIB_FOLDER),
  BINARIES_FOLDER: FileSystem.getAppPath(BINARIES_FOLDER),
  TMP_FOLDER: FileSystem.getTmpPath(ROOT_FOLDER),
};
