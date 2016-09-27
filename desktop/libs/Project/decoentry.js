import React, { Component } from 'react'
import { AppRegistry } from 'react-native'

// modify this variable to move around components and screens
let Entry = require('./index')

// point to index if this is a release build
if (!__DEV__) {
  Entry = require('./index')
}

// Check if we're dealing with ES6-style imports
if (typeof Entry === 'object' && Entry !== null && Entry.default) {

  // If we are, pick the default import
  Entry = Entry.default
}

class Root extends Component {
  render() {
    return <Entry/>
  }
}

AppRegistry.registerComponent('Project', () => Root)
