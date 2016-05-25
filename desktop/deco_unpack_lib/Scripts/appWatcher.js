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

var child_process = require('child_process');

WAKE_UP_INTERVAL_IN_MS = 2000; //2 seconds

var wakeUpAndCheck = setInterval(function() {
  var simulatorIsOpen = false;
  try {
    simulatorIsOpen = child_process.execSync('ps -ef | grep "[S]imulator.app"').toString() != "";
  } catch (e) {
    if (e.error != null) {
      console.error(e)
    }
  }
  process.send({ simStatus: simulatorIsOpen });
}, WAKE_UP_INTERVAL_IN_MS);

process.on('disconnect', function() {
  console.log('parent has disconnected, process will shut down');
  clearInterval(wakeUpAndCheck)
  process.exit(0);
});

process.on('SIGTERM', function() {
  clearInterval(wakeUpAndCheck);
  process.exit(0);
})

process.on('close', function() {
  clearInterval(wakeUpAndCheck);
  process.exit(0);
})
