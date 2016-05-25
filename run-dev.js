#!/usr/bin/env node
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


var fork = require('child_process').fork
var path = require('path')

var onExit = function(child) {
  if (child && !child.killed) {
    child.kill()
  }
}

var child = fork(path.join(__dirname, './desktop/node_modules/.bin/gulp'), ['start'], {
  cwd: path.join(__dirname, './desktop')
})

process.on('exit', onExit.bind(this, child))


var child = fork(path.join(__dirname, './web/node_modules/.bin/gulp'), ['watch'], {
  cwd: path.join(__dirname, './web')
})

process.on('exit', onExit.bind(this, child))
