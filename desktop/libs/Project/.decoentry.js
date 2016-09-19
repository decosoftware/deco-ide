import { AppRegistry } from 'react-native'

let entry = require('actual-entry-file.js')

// Check if we're dealing with ES6-style imports
if (typeof entry === 'object' && entry !== null && entry._esModule) {
  
  // If we are, pick the default import
  entry = entry.default
}

if (typeof entry === 'function') {
  AppRegistry.registerComponent(() => entry)  
}
