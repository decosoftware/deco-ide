'use strict'

const fs = require('fs')
const path = require('path')
const clinput = require('minimist')(process.argv.slice(2))

const AVAILABLE_TASKS = {
  'sim-ios': {
    args: [
      'deviceId',
      'target',
    ],
    argInfo: [
      'launch the iOS simulator',
      'the udid of device to launch',
      'the path to your pre-built .app file'
    ],
  },
  'sim-android': {
    args: [
      'deviceId',
      'target',
    ],
    argInfo: [
      'launch the android simulator',
      'the avd of the device to launch',
      'the path to your pre-buil .apk file',
    ]
  },
  'build-ios': {
    args: [
      'scheme',
      'deviceId',
      'project',
    ],
    argInfo: [
      'builds the .app file',
      'the target scheme name',
      'the udid of device to build on',
      'the project file to use'
    ],
  },
  'build-android': {
    args: [],
    argInfo: [
      'builds the .apk file'
    ],
  },
  'run-packager': {
    args: [
      'port',
    ],
    argInfo: [
      'starts the react-native packager',
      'the port packager will listen on',
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
Usage: deco-cli <taskname> [options...]

where \`<taskname> [options...]\` is one of:

${taskToHelpString()}
optional flags:

    -r <root_dir> \t changes the working directory to <root_dir>

---
Specifying a deco-cli configuration file:

If a configure.deco.js file is present in the working directory,
deco-cli will run the function from that file rather than using
its own behavior.

For example, if you run the command: \`deco-cli sim-ios --deviceId MY-D3V1CE-1D-2BCONT-U3D --target /path/to/my.app\`

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

this ensures the child process will be killed on exit of the parent process.

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
  return
}

if (clinput.h || clinput.help) {
  printHelp()
  return
}

// change working directory
if (clinput.r) {
  process.chdir(clinput.r)
}

var CONFIG_FILE_NAME = 'configure.deco.js'
var REGISTERED_TASKS = {}
global.DECO = class DECO {
  static on(taskname, fn) {
    REGISTERED_TASKS[taskname] = fn
  }
}

// load in config file from root
const filePath = path.join(process.cwd(), CONFIG_FILE_NAME)
try {
  fs.statSync(filePath)
  require(filePath)
} catch (e) {
  console.log('No user specified config file was found, falling back to default!')
  require(path.join(moduleWorkingDir, '/configure.deco.js'))
}

const formatArguments = (specifiedTask) => {
  let args = {}
  AVAILABLE_TASKS[specifiedTask].args.forEach((arg) => {
    try {
      if (clinput[arg]) {
        args[arg] = clinput[arg]
      }
    } catch (e) {
      console.error('Task arguments were ill formed', e)
      printHelp()
      return
    }
  })

  if (Object.keys(args).length != AVAILABLE_TASKS[specifiedTask].args.length) {
    console.error('Specified task is missing required arguments!')
    printHelp()
    return
  }

  return args
}


const TASK = clinput._[0]
const ARGS = formatArguments(TASK)
if (!ARGS) {
  return
}

if (!REGISTERED_TASKS[TASK]) {
  // load default configure deco js file if no task was registered by user
  console.log('No user specified task was registered, falling back to default!')
  require(path.join(moduleWorkingDir, '/configure.deco.js'))
}

REGISTERED_TASKS[TASK](ARGS).then((resp) => {
  if (resp && resp.child && !resp.child.killed) {
    process.on('close', () => {
      resp.child.kill()
    })
    process.on('SIGTERM', () => {
      resp.child.kill()
    })
  }
})
