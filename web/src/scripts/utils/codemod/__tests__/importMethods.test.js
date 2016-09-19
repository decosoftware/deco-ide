import CodeMod from '../'

test('add import to top of code', () => {
  const mod = new CodeMod('')
  const output = mod.transform.addImport('Navigator', [], 'testo-sdk').toSource()
  expect(output).toBe('import Navigator from \"testo-sdk\";')
})

test('add namespace import and default import', () => {
  const mod = new CodeMod('')
  const result = mod.transform.addImport(
    'Default', ['Name1', 'Name2'], 'testo-sdk'
  ).toSource()
  expect(result).toBe('import Default, {Name1, Name2} from \"testo-sdk\";')
})

test('remove import from top of code', () => {
  const mod = new CodeMod(`
import Navigator from 'testo-sdk'`)
  const output = mod.transform.removeImport('testo-sdk').toSource()
  expect(output).toBe('\n')
})

test('update import to include new named import', () => {
  const mod = new CodeMod(`import Navigator, {Name1, Name2} from "testo-sdk"`)
  const output = mod.transform.updateImport('Navigator', [
    'Name1', 'Name2', 'Name3',
  ], 'testo-sdk').toSource()
  expect(output).toBe(
    'import Navigator, {Name1, Name2, Name3} from \"testo-sdk\";'
  )
})

test('update import source for require', () => {
  const mod = new CodeMod(`
let entry = require('./my-source-file')`)
  const output = mod.transform
    .updateImportSourceForRequire('entry', './new-source').toSource()
  expect(output).toBe(`
let entry = require("./new-source")`)
})

test('get default import for source', () => {
  const mod = new CodeMod(`
import Navigator from 'testo-sdk'`)
  const output = mod.transform.defaultImportForSource('testo-sdk')
  expect(output).toBe('Navigator')
})

test('get all requires from source', () => {
  const mod = new CodeMod(`
const React = require('whatup')
const Doobie = require('shoobie')`)
  const output = mod.transform.getAllRequires()
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
  const mod = new CodeMod(`
import Navigator from 'testo-sdk'
import React, { Component, PropTypes } from 'react'`)

  const output = mod.transform.getAllImports()
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
