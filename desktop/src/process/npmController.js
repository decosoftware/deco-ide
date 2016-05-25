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

import once from 'once'
import { fork } from 'child_process'
import path from 'path'

class npm {
  static run(cmd = [], opts = {}, cb, progress) {
    cb = once(cb)

    var execPath = path.join(__dirname, '../node_modules/npm/bin/npm-cli.js')

    var child = fork(execPath, cmd, opts)

    child.on('error', cb)

    child.on('close', function (code) {
      cb(null, code)
    })

    if (progress) {
      child.on('message', function(response) {
        if (response) {
          progress(response.progress)
        }
      })
    }

    return child
  }
}

export default npm
