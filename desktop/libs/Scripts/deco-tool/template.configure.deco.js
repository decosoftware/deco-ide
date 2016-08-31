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
 *
 * Runs a registered function in an isolated NodeJS environment when that function's corresponding
 * command is triggered from within the Deco application or when run from shell as a 'deco-tool' command
 *
 * Available commands:
 * 	run-packager (!)
 * 		description: Run packager for project
 * 		return:
 * 			resolve({child: ChildProcess})
 *
 *  list-ios-sim
 *  	description: Find list of available iOS simulators
 *  	return:
 *  		resolve({payload: [{name:String}]})
 *      reject({payload: [String]})
 *
 * 	sim-ios
 * 		description: Launch an iOS simulator and load the .app binary
 *
 * 	reload-ios-app
 * 		description: Hard reload the current iOS application in the simulator
 *
 * 	build-ios (!)
 * 		description: Build the iOS application
 * 		return:
 * 			resolve({child: ChildProcess})
 *
 * 	list-android-sim
 * 		description: Find list of available Android emulators
 *  	return:
 *  		resolve({payload: [{name:String}]})
 *      reject({payload: [String]})
 *
 * 	reload-android-app
 * 		description: Hard reload the current Android application in the emulator
 *
 * 	sim-android (!)
 * 		description: Build app and launch the Android emulator from available list
 * 		return:
 * 			resolve({child: ChildProcess})
 *
 * (!) Be careful to return any async children processes spawned
 *
 *
 * HOW TO REGISTER A COMMAND
 * Deco.on(command: String, do: (args: Object) => Promise)
 *
 * eg.
 * Deco.on(list-android-sim, function(args) {
 * 		// this will print out the args into the Deco output window
 * 		// or into your shell terminal if using 'deco-tool' module
 * 		console.log(args)
 *
 * 		// the function should return a Promise
 * 		return Promise.reject({
 * 			payload: ['Error Message']
 * 		})
 * })
 *
 * If you create an asynchronous child process, you should handle it properly
 * by returning an object of form { child: {ChildProcess} } in the "resolve" call
 * from within your promise.
 *
 * eg.
 * ...
 * const spawnPackager = child_process.spawn(...)
 * return Promise.resolve({child: spawnPackager})
 **/
