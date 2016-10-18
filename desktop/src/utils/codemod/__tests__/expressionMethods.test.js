import CodeMod from '../'

test('adds a function call to code', () => {
  const mod = CodeMod('')
  const output = mod.addFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'fosho'
    }]
  ).toSource()
  expect(output).toBe(`Happy.funTimes("fosho");`)
})

test('add empty function call', () => {
  const mod = CodeMod(``)
  const output = mod.addFunctionCall(
    'Happy', 'funTimes', []
  ).toSource()
  expect(output).toBe(`Happy.funTimes();`)
})

test('add empty function call with comment', () => {
  const mod = CodeMod(``)
  const output = mod.addFunctionCall(
    'Happy', 'funTimes', [], {
      withComment: {value: 'test'},
    }
  ).toSource()
  expect(output).toBe(`//test
Happy.funTimes();`)
})

test('updates a function call in the code', () => {
  const mod = CodeMod(`Happy.funTimes("fosho");`)
  const output = mod.updateFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'nomo'
    }]
  ).toSource()
  expect(output).toBe(`Happy.funTimes("nomo");`)
})

test('remove all object.property function calls in the code', () => {
  const mod = CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.removeFunctionCall(
    'Happy', 'funTimes'
  ).toSource()
  expect(output).toBe(`
`)
})

test('remove function calls that perfectly match in code', () => {
  const mod = CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.removeFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'nomo'
    }]
  ).toSource()
  expect(output).toBe(`
Happy.funTimes("fosho")`)
})

test('get all matching function calls', () => {
  const mod = CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.getAllMatchingFunctionCalls(
    'Happy', 'funTimes'
  )
  expect(output).toEqual([{
    object: 'Happy',
    property: 'funTimes',
    args: [{
      type: 'Literal',
      value: 'fosho'
    }],
    source: {
      start: { line: 2, column: 0},
      end: { line: 2, column: 23 }
    }
  }, {
    object: 'Happy',
    property: 'funTimes',
    args: [{
      type: 'Literal',
      value: 'nomo'
    }],
    source: {
      start: { line: 3, column: 0 },
      end: { line: 3, column: 22 }
    }
  }])
})

test('test nested function calls in react syntax', () => {
  const mod = CodeMod(`import React, { Component, } from 'react'
  import { View, } from 'react-native'
  import { NavigatorActions } from 'deco-sdk'

  class Scene1 extends Component {

    static propTypes = {}

    static defaultProps = {}

    constructor(props) {
      super(props)
      this.state = {}

    }

    render() {
      return (
        <View onPress={ () => NavigatorActions.push('scene2') }>
        </View>
      )
    }
  }

  export default Scene1`)
  const output = mod.getAllMatchingFunctionCalls(
    'NavigatorActions',
    'push'
  )
  expect(output).toEqual([{
    "args": [
      {
        "type": "Literal",
        "value": "scene2"
      }
    ],
    "object": "NavigatorActions",
    "property": "push",
    "source": {
      "end": {
        "column": 61,
        "line": 19
      },
      "start": {
        "column": 30,
        "line": 19
      }
    }
  }])
})

test('match a function inlined on export default', () => {
  const mod = CodeMod(`import { SceneManager, Navigational, Adapters } from 'deco-sdk'
  Navigational.registerAdapter(Adapters.NavigatorIOSAdapter)

  import Scene1 from './Scene1'
  SceneManager.registerScene('Scene1', Scene1)


  export default SceneManager.registerEntryScene('Scene1')`)

  const output = mod.getAllMatchingFunctionCalls(
    'SceneManager',
    'registerEntryScene'
  )
  expect(output).toEqual([{
    "args": [
      {
        "type": "Literal",
        "value": "Scene1"
      }
    ],
    "object": "SceneManager",
    "property": "registerEntryScene",
    "source": {
      "end": {
        "column": 58,
        "line": 8
      },
      "start": {
        "column": 2,
        "line": 8
      }
    }
  }])
})

test('add function call after comment', () => {
  const mod = CodeMod(`
Happy.funTimes("fosho")
//comment
Happy.funTimes("nomo")`)
  const output = mod.addFunctionCall(
    'Happy', 'wat', [{
      type: 'Literal', value: 'idkman'
    }], {
      afterCommentMatching: 'comment'
    }
  ).toSource()
  expect(output).toBe(`
Happy.funTimes("fosho")

//comment
Happy.wat("idkman");

Happy.funTimes("nomo");`)
})

test('remove function call after comment', () => {
  const mod = CodeMod(`
Happy.funTimes("fosho")

//comment
Happy.wat("idkman");

Happy.funTimes("nomo");`)
  const output = mod.removeFunctionCall(
    'Happy', 'wat', [{
      type: 'Literal', value: 'idkman'
    }], {
      preserveComments: true,
    }
  ).toSource()
  expect(output).toBe(`
Happy.funTimes("fosho")

//comment
Happy.funTimes("nomo");`)
})
