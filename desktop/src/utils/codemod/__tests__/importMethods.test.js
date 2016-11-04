import CodeMod from '../'

test('add import to top of code', () => {
  const mod = CodeMod('')
  const output = mod.addImport('Navigator', [], 'testo-sdk').toSource()
  expect(output).toBe('import Navigator from \"testo-sdk\";')
})

test('add namespace import and default import', () => {
  const mod = CodeMod('')
  const result = mod.addImport(
    'Default', ['Name1', 'Name2'], 'testo-sdk'
  ).toSource()
  expect(result).toBe('import Default, {Name1, Name2} from \"testo-sdk\";')
})

test('remove import from top of code', () => {
  const mod = CodeMod(`
import Navigator from 'testo-sdk'`)
  const output = mod.removeImport('testo-sdk').toSource()
  expect(output).toBe('\n')
})

test('update import to include new named import', () => {
  const mod = CodeMod(`import Navigator, {Name1, Name2} from "testo-sdk"`)
  const output = mod.updateImport('Navigator', [
    'Name1', 'Name2', 'Name3',
  ], 'testo-sdk').toSource()
  expect(output).toBe(
    'import Navigator, {Name1, Name2, Name3} from \"testo-sdk\";'
  )
})

test('update import source for require', () => {
  const mod = CodeMod(`
let entry = require('./my-source-file')`)
  const output = mod
    .updateImportSourceForRequire('entry', './new-source').toSource()
  expect(output).toBe(`
let entry = require("./new-source")`)
})

test('get default import for source', () => {
  const mod = CodeMod(`
import Navigator from 'testo-sdk'`)
  const output = mod.defaultImportForSource('testo-sdk')
  expect(output).toBe('Navigator')
})

test('get all requires from source', () => {
  const mod = CodeMod(`
const React = require('whatup')
const Doobie = require('shoobie')`)
  const output = mod.getAllRequires()
  expect(output).toEqual([
    {
      kind: 'const',
      require: {
        identifier: 'React',
        source: 'whatup',
      },
    },
    {
      kind: 'const',
      require: {
        identifier: 'Doobie',
        source: 'shoobie',
      },
    },
  ])
})

test('get all imports from source', () => {
  const mod = CodeMod(`
import Navigator from 'testo-sdk'
import React, { Component, PropTypes } from 'react'`)

  const output = mod.getAllImports()
  expect(output).toEqual([
    {
      identifiers: [{
        kind: 'Default',
        value: 'Navigator',
      }],
      source: 'testo-sdk',
    },
    {
      identifiers: [{
        kind: 'Default',
        value: 'React',
      }, {
        kind: 'Named',
        value: 'Component',
      }, {
        kind: 'Named',
        value: 'PropTypes'
      }],
      source: 'react'
    }
  ])
})

test('update require in a decoentry', () => {
  const mod = CodeMod(`import React, { Component } from 'react'
  import { AppRegistry } from 'react-native'

  // Patch \`AppRegistry.registerComponent\` on first launch
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
  // so don't reset \`global.getComponent\`
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

      // Try to use the registered component, falling back to the \`require\`d component
      let EntryComponent = global.hasRegistered ? global.getComponent() : Entry

      // Due to race conditions in component patching (I think), switching to a
      // registered component may have happened and then been reset. However, the
      // \`global.getComponent\` call will still return the correct component.
      // Assume this is the case if we get an invalid component from \`require\`.
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
`)
const output = mod
  .updateImportSourceForRequire('Entry', './scene1').toSource()
expect(output).toBe(`import React, { Component } from 'react'
  import { AppRegistry } from 'react-native'

  // Patch \`AppRegistry.registerComponent\` on first launch
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
  // so don't reset \`global.getComponent\`
  module.hot.accept(() => {
    global.hasRegistered = false
  })

  class ProxyRoot extends Component {
    render() {
      let Entry = require("./scene1")

      // Require interop
      if (typeof Entry === 'object' && Entry !== null && Entry.__esModule) {
        Entry = Entry.default
      }

      // Try to use the registered component, falling back to the \`require\`d component
      let EntryComponent = global.hasRegistered ? global.getComponent() : Entry

      // Due to race conditions in component patching (I think), switching to a
      // registered component may have happened and then been reset. However, the
      // \`global.getComponent\` call will still return the correct component.
      // Assume this is the case if we get an invalid component from \`require\`.
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
`)
})
