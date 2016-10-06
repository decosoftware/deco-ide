import React, { Component } from 'react'
import { AppRegistry } from 'react-native'

// Patch `AppRegistry.registerComponent` on first launch
if (!global.originalRegister) {
  global.hasRegistered = false
  global.hasRegisteredOnce = false
  global.getComponent = null

  global.originalRegister = AppRegistry.registerComponent

  AppRegistry.registerComponent = (appKey, fn) => {
    global.hasRegistered = true
    global.hasRegisteredOnce = true
    global.getComponent = fn
  }
}

// On hot reload, we want to reset registration. There's a caveat, however:
// Because registration order isn't gauranteed, we may still want to display
// the previously registered component (which will patch itself, and not be stale)
// so don't reset `global.getComponent`
module.hot.accept(() => {
  global.hasRegistered = false
})

class ProxyRoot extends Component {
  render() {
    let Entry = require("./index.ios")

    // Require interop
    if (typeof Entry === 'object' && Entry !== null && Entry.__esModule) {
      Entry = Entry.default
    }

    // Try to use the registered component, falling back to the `require`d component
    let EntryComponent = global.hasRegistered ? global.getComponent() : Entry

    // Due to race conditions in component patching (I think), switching to a
    // registered component may have happened and then been reset. However, the
    // `global.getComponent` call will still return the correct component.
    // Assume this is the case if we get an invalid component from `require`.
    if (typeof EntryComponent === 'object') {
      if (global.hasRegisteredOnce) {
        EntryComponent = global.getComponent()

      // If all else fails, return null and render nothing
      } else {
        console.warn(
          'Failed to find component registered with AppRegistry.registerComponent or ' +
          'exported by the app entry file.'
        )
        return null
      }
    }

    return <EntryComponent />
  }
}

global.originalRegister('Project', () => ProxyRoot)
