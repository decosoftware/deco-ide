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

const fs = require('fs')
const path = require('path')
const clinput = require('minimist')(process.argv.slice(2))
const stripComments = require('./util/stripComments')

let RUNNING_DEFAULT = false

const handleError = (e) => {
  if (process.send) {
    process.send({
      _configError: true,
      errorMessage: `Error in config: ${e.toString()}`,
    })
  } else {
    console.error(`\nLocal config is broken: \n\n[${e}]\n`)
    process.exit(1)
  }
}

const AVAILABLE_TASKS = {
  'list-ios-sim': {
    args: [],
    argInfo: [
      'list the available simulators',
    ]
  },
  'reload-ios-app': {
    args: [],
    argInfo: [
      'relaunches the application on the iOS simulator'
    ]
  },
  'reload-android-app': {
    args: [],
    argInfo: [
      'relaunches the application on the Android emulator'
    ]
  },
  'sim-ios': {
    args: [
      'deviceId'
    ],
    argInfo: [
      'launch the iOS simulator',
      'the udid of device to launch',
    ],
  },
  'list-android-sim': {
    args: [],
    argInfo: [
      'lists created devices from android emulator',
    ]
  },
  'sim-android': {
    args: [
      'deviceId'
    ],
    argInfo: [
      'executes react native\'s "run android"',
      'the name of the emulator to launch',
    ]
  },
  'build-ios': {
    args: [
      'deviceId'
    ],
    argInfo: [
      'builds the .app file',
      'the udid of device to build on',
    ],
  },
  'build-android': {
    args: [],
    argInfo: [
      'builds the .apk file'
    ],
  },
  'run-packager': {
    args: [],
    argInfo: [
      'starts the react-native packager',
    ]
  },
  'init-template': {
    args: [],
    argInfo: [
      'creates a template configure.deco.js in the working directory',
    ]
  }

}

const taskToHelpString = () => {
  let helpString = ''
  Object.keys(AVAILABLE_TASKS).forEach((key) => {
    helpString += `
    ${key} \t ${AVAILABLE_TASKS[key].argInfo[0]}

    `
    AVAILABLE_TASKS[key].args.forEach((keyArg, i) => {
      helpString += `\t--${keyArg} <${keyArg}> \t${AVAILABLE_TASKS[key].argInfo[i+1]}\n`
    })
    helpString += '\n'
  })
  return helpString
}

const printHelp = () => {

  console.log(`
Usage: deco-tool <taskname> [options...]

where \`<taskname> [options...]\` is one of:

${taskToHelpString()}
optional flags:

    -r <root_dir> \t changes the working directory to <root_dir>

---
Specifying a deco-tool configuration file:

If a configure.deco.js file is present in the working directory,
deco-tool will run the function from that file rather than using
its own behavior.

For example, if you run the command: \`deco-tool sim-ios --deviceId MY-D3V1CE-1D-2BCONT-U3D --target /path/to/my.app\`

a configure.deco.js, in the current working directory, which included a function as shown below...

\`
// Function must return a promise
let taskname = 'sim-ios'
DECO.on(taskname, function(args) {
  console.log(args.deviceId)
  console.log(args.target)
  return Promise.resolve()
})
\`

would yield an expected output of...

> MY-D3V1CE-1D-2BCONT-U3D
> /path/to/my.app

Optionally, you may return an object on the resolve() call. For example...

\`
const myChild = child_process.spawn(...)
Promise.resolve({ child: myChild })
\`

this ensures the child process will be handled properly

`)

}

let moduleWorkingDir = __dirname

let foundTask = Object.keys(AVAILABLE_TASKS).filter((key) => {
  if (key == clinput._[0]) {
    return true
  }
})

if (foundTask.length == 0) {
  printHelp()
  process.exit(0)
}

if (clinput.h || clinput.help) {
  printHelp()
  process.exit(0)
}

// change working directory
if (clinput.r) {
  process.chdir(clinput.r)
}

var CONFIG_FILE_NAME = 'configure.deco.js'
var METADATA_DIR = '.deco'
var SETTINGS_FILE_NAME = '.settings'
var REGISTERED_TASKS = {}

// get settings file from project
const settingsPath = path.join(process.cwd(), METADATA_DIR, SETTINGS_FILE_NAME)
let PROJECT_SETTING = {}
try {
  fs.statSync(settingsPath)
  PROJECT_SETTING = JSON.parse(stripComments(fs.readFileSync(settingsPath).toString()))
} catch (e) {
  console.log('Warning: No local .settings file is present at path: ' + settingsPath + ' falling back to defaults.')
  try {
    const getDefaults = require(path.join(moduleWorkingDir, 'default.settings.js'))
    const projectName = path.basename(process.cwd())
    PROJECT_SETTING = getDefaults(projectName)
  } catch (e) {

  }
}

const DECO = class DECO {
  static on(taskname, fn) {
    REGISTERED_TASKS[taskname] = fn
  }
}

DECO.setting = PROJECT_SETTING

// Alias deco-tool into the require statements
const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id == 'deco-tool') {
    return DECO
  } else {
    return originalRequire.apply(this, arguments)
  }
}


// load in config file from root
const filePath = path.join(process.cwd(), CONFIG_FILE_NAME)
try {
  fs.statSync(filePath)
  console.log('Running with Deco config found at ./configure.deco.js')
  require(filePath)
} catch (e) {
  // no file, that's ok
  if (e.code == 'ENOENT') {
    console.log('Running with default Deco config')
  } else {
    handleError(e)
  }
  require(path.join(moduleWorkingDir, '/configure.deco.js'))
}

const TASK = clinput._[0]
let ARGS = Object.assign({}, clinput)
delete ARGS.r
delete ARGS._

if (!REGISTERED_TASKS[TASK]) {
  // load default configure deco js file if no task was registered by user
  console.log('No user specified task was registered, falling back to default!')
  require(path.join(moduleWorkingDir, '/configure.deco.js'))
}

const handleChildren = (resp) => {
  const safeKill = () => {
    if (resp && resp.child && !resp.child.killed) {
      resp.child.kill('SIGINT')
    }
  }

  process.on('uncaughtException', () => {
    safeKill()
  })
  process.on('SIGINT', () => {
    safeKill()
  })
  process.on('exit', () => {
    safeKill()
  })
}

const shipPayload = (resp) => {
  if (process.send) {
    process.send(resp)
  } else {
    console.log(resp.payload)
  }
}

try {
  REGISTERED_TASKS[TASK](ARGS)
    .then((resp) => {
      if (resp && resp.child && !resp.child.killed) {
        handleChildren(resp)
      }
      if (resp && resp.payload) {
        shipPayload(resp)
      }
    })
    .catch((resp) => {
      if (resp && resp.child && !resp.child.killed) {
        handleChildren(resp)
      }
      if (resp && resp.payload) {
        shipPayload({
          error: true,
          payload: resp.payload,
        })
      }
    })
} catch (e) {
  console.error(e)
  handleError(e)
}
