# Customizing Deco

## Introduction

This section specifies how to integrate custom functionality into Deco when the default behavior does not fit your React Native project.

Deco, by design, is built to handle the external processes of React Native development for you. This includes building the application, launching simulators, and launching the packager. Usually this is great for the average developer. It saves people time.

However, not all projects are created equal and occasionally these defaults
will not work for your project. This is why we built Deco Config. It lets you register custom code that Deco will use instead of its default behavior.

*The "bye-bye" packager scenario*
> *You:* Hey Deco, you're super great and all, but the packager you turn on by default keeps getting in the way. Can I please use my external one?

> *Deco:* Caaan Do! Register a dummy function on the 'run-packager' command and bye-bye Deco packager functionality.

> *Both:* BOOYAKASHA!

*The custom build scenario*

> Your React Native project is a marvel of modern software engineering. "One does not simply `react-native run-ios` my project!", you scoff. Well, Deco doesn't know what to do in this scenario, because it's basically just `react-native run-ios` under the hood — womp! Using cmd+B (Tools > Build) in Deco will lead to sour disappointment.

>This is where you come in. Simply register a function on the 'build-ios' command to conduct your elaborate build procedure and now cmd+B (Tools > Build) in Deco works like a charm.

*The custom simulator menu scenario*

>I want a button in the simulator menu that launches Android Studio.

>Done! Simply register a function on the 'list-android-sim' and 'sim-android' commands. Voilà — some clever code can make it happen.

> *Hint:* we use this trick for Genymotion ;).

## Table of Contents

- [Create a deco config file](#create-a-deco-config-file)
- [Using deco-tool](#using-deco-tool)
  - [Customizing a Deco Command](#customizing-a-deco-command)
    - [Spawning Children](#spawning-children)
    - [Customizing the Simulator Menu](#customizing-the-simulator-menu)
- [Injecting Settings through the Deco Settings File](#injecting-settings-through-the-deco-settings-file)
- [Available Commands](#available-commands)

## Create a Deco Config File

The configure.deco.js should be in the top-level of your project
```
cd $PROJECT_ROOT
touch configure.deco.js
```

You can also open Deco and, in the menu bar, go to **Install > Add deco config to project**

This will create a template configure.deco.js that will look something like...

```
'use strict'

var child_process = require('child_process')
var path = require('path')

// You must use require for deco-tool, import/export is not supported
var Deco = require('deco-tool')

// These are settings from the local projects .deco/.settings JSON file
const iosTarget = Deco.setting.iosTarget
const iosProject = Deco.setting.iosProject
const iosBuildScheme = Deco.setting.iosBuildScheme
const androidManifest = Deco.setting.androidManifest
const packagerPort = Deco.setting.packagerPort

/**
 *
 * HOW TO USE THIS FILE (https://github.com/decosoftware/deco-ide/blob/master/desktop/CONFIGURE.MD)
....
```

## Using deco-tool

Deco will look for the 'deco-tool' alias in your configure.deco.js file, all you need to do is require it.
```
var Deco = require('deco-tool')
```

The 'deco-tool' object has two properties

```
/**
 * Register a custom command
 *
 * @type {Function}
 * @param command {String} name of the command
 * @param do {Function} function run for command, must return a Promise
 * @return {undefined}
 */
Deco.on(command, do) {...}

/**
 * Access the local project .settings JSON
 * @type {Object}
 */
Deco.setting
```

### Customizing a Deco command

You can register a function to be used when a certain action has taken place by registering that function on the actions corresponding command.

eg.
```
Deco.on('sim-ios', function(args) {
  console.log(args)
  return Promise.resolve()
})
```

Once the configure.deco.js is saved, Deco will recognize a new function has been registered. When you click on 'iPhone 6' in the simulator menu, for example, this new function will be called instead of the default function.

The behavior of our new function is the args are simply printed into the packager output. The default Deco behavior of launching the iOS simulator has been successfully overridden!

#### Spawning Children

ChildProcesses that are spawned inside a function should be returned in the Promise.

**Example**
```
  const myChild = child_process.spawn(...)
  return Promise.resolve({ child: myChild })
```

This ensures that the child process is properly handled on exit. Failing to do so, may result in unpredictable behavior.

#### Customizing the Simulator Menu

The commands '*list-ios-sim*' and '*list-android-sim*' are special functions
because they return objects back to Deco to display in the simulator menu.

The example below demonstrates how to use these functions...
```
Deco.on('list-android-sim', function(args) {
  try {
	// some logic to find android simulators
    // ...
    // ...
    return Promise.resolve({
      payload: [{
        name: 'AndroidSim', // Deco looks for name key to display in Simulator Menu
        deviceId: 's0me-dev1c3-1D',
        version: '6.0',
      }]
    })
  } catch (e) {
    return Promise.reject({
      // Separate entries in the array are spaced for readability
      // This error text will be displayed instead of simulator buttons
      payload: ['This is a custom', 'error message']
    })
  }
})

Deco.on('sim-android', function(args) {
  console.log(args)
  // clicking 'AndroidSim' in Deco simulator menu should print to console
  // { name: 'AndroidSim', deviceId: 's0me-dev1c3-1D', version: '6.0'}
  return Promise.resolve()
})
```

#### Injecting Settings through the Deco Settings File

Each project used by Deco allows a $PROJECT_ROOT/.deco/.settings file.

The .settings file is a JSON file. This file is parsed by Deco each time a
command is run and is accessible through deco-tool.

You can access this file manually, or in Deco by going to **Deco > Project Settings**

**Default .setting file**
```
  // relative path from project root to the .app binary that is generated after building iOS
  "iosTarget": "ios/build/Build/Products/Debug-iphonesimulator/Project.app",

  // relative path from project root to the xcode project or workspace file for iOS build
  "iosProject": "ios/Project.xcodeproj",

  // scheme name to use when building in Deco
  "iosBuildScheme": "Project",

  // relative path from project to the AndroidManifest.xml file for your application
  "androidManifest": "android/app/src/main/AndroidManifest.xml",

  // port for the packager to run on
  "packagerPort": 8081
```

**Usage example**
```
var Deco = require('deco-tool')
console.log(Deco.setting.packagerPort)
// > 8081
```


### Available Commands

*run-packager*

> Run the react-native packager.

*list-ios-sim*

> Return a list of iOS simulators available.

*sim-ios*

> Launch an iOS simulator and load the .app binary.

*reload-ios-app*

> Hard reload the current iOS application in the simulator

*build-ios*

> Build the projects iOS application

*list-android-sim*

> Return a list of Android emulators available.

*reload-android-app*

> Hard reload the current Android application in the emulator.

*sim-android*

> Build projects Android app, launch the Android emulator, and load the app onto the emulator.
