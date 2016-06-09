## Desktop

The desktop module runs in the **main process** of Electron. It is used to interface with system-level APIs exposed through Electron and to control external processes.

To start the desktop application run:
```
$ npm run start
```

To trigger a locally testable production build (including the bundle from web package) run:
```
$ npm run pack
```

the package will be output to `./dist/osx/Deco-$VERSION.pkg`

#### A few things to note:

- desktop/deco_unpack_lib is a folder of external scripts, binaries, and application metadata that are unpacked into the ~/Library/Application Support/com.decosoftware.Deco folder on install. In the event where you need to change something in deco_unpack_lib and test the new functionality, you will need to run `npm run copy-libs` to manually install the updated folder into your systems Application Support folder.

- The `npm run start` task passes in a 'developer' flag to the main process. Certain things are turned off as a result, paths are changed, etc. depending on whether the `__DEV__` variable is set to true. Mainly, `__DEV__` turns OFF the update mechanism, turns ON the developer tools, and loads the web code from a localhost webpack server rather than from a static file.

#### Upgrading the temporary Project template

1. Create a "temp" RN project on the latest stable release by running `react-native init Project` somewhere outside of the `deco-ide` project
2. Build the iOS app in Xcode (**Note**: You don’t even need to run the RN packager, we just need the binary.)
3. Open “Window > Projects” in Xcode and follow the link to the “Derived Data” for the Project. Dig down until you find the `Debug-iphonesimulator/Project.app` file.
4. Copy that file into the root of your "temp" RN project: ie. `~/Path/To/Project/Project.app`
5. Navigate to the `deco-ide/desktop` directory and run:
    
    ```
    npm run upgrade-project-template -- --projectPath ~/Path/To/Project
    ```
    
6. You may have to enter your password at some point during the last step.
7. Open Deco, press "New Project"
8. Enjoy your freshly updated RN template 👍 

#### Architecture Overview

##### Actions
Actions look similar to how they would in a flux/redux application (ie. functions that return an object with type: ACTION). These are used primarily by "handlers" to respond to `ipc` requests triggered by the renderer process (web bundle) or to system events that should be sent asynchronously over the bridge for the renderer process to react.

##### Bridge
The bridge is an abstraction around Electron's `ipc` module. Both the web and the desktop modules share constants from the `deco-ide/shared` module. The bridge takes the output from an Action function and sends it to the renderer process, or receives an Action from the renderer process and triggers a listener registered by the handler.

##### Handlers
Handlers mainly implement desktop functionality required to support the renderer process. Handlers are registered in the `handlers/index.js` file. The `registerHandlers()` function is called on startup by the main file. Each handler should implement a `register()` function which registers Action Type listeners on the bridge. The registered functions should have the form of `func(payload, respond)` where `payload` is the Web Action object sent from the renderer and `respond` is a callback that takes a Desktop Action and sends it back to resolve the promise on the renderer side. `actions/genericActions.js` can be used if no specific return payload is needed by the Renderer.

##### Constants
This includes convenience constants for often used paths and dialog constants for popup dialogs.

##### Menu
Most of the destkop's native menu logic is implemented in the `menu/templateBuilder.js` file.

##### Process
Process Controllers manage the external processes necessary to support the Simulator, the React Packager, NPM, and the xcodebuild utility. Generally these will be called by Handlers to perform certain tasks.

##### Window
The window manager simply initializes and controls the desktop BrowserWindow object.
