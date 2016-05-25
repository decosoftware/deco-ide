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
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
 import _ from 'lodash'

const matchingSimulator = (simulators, simulatorName) => {

  const simulatorsByVersion = _.chain(simulators)
    .orderBy('version', 'desc')
    .unionBy('name')
    .reverse()
    .value()

  for (let i = simulatorsByVersion.length - 1; i >= 0; i--) {
    if (simulatorsByVersion[i].name === simulatorName) {
      return simulatorsByVersion[i]
    }
  }

  return simulatorsByVersion[0]
}

const parseSimulatorList = (text) => {
  const devices = []
  var currentOS = null

  text.split('\n').forEach((line) => {
    var section = line.match(/^-- (.+) --$/)
    if (section) {
      var header = section[1].match(/^iOS (.+)$/)
      if (header) {
        currentOS = header[1]
      } else {
        currentOS = null
      }
      return
    }

    const device = line.match(/^[ ]*([^()]+) \(([^()]+)\)/)
    if (device && currentOS) {
      var name = device[1]
      var udid = device[2]
      devices.push({udid, name, version: currentOS,})
    }
  })

  return devices
}

module.exports = {
  matchingSimulator: matchingSimulator,
  parseSimulatorList: parseSimulatorList,
}
