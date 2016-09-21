import CodeMod from '../'

test('adds a function call to code', () => {
  const mod = new CodeMod('')
  const output = mod.transform.addFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'fosho'
    }]
  ).toSource()
  expect(output).toBe(`Happy.funTimes("fosho");`)
})

test('add empty function call', () => {
  const mod = new CodeMod(``)
  const output = mod.transform.addFunctionCall(
    'Happy', 'funTimes', []
  ).toSource()
  expect(output).toBe(`Happy.funTimes();`)
})

test('updates a function call in the code', () => {
  const mod = new CodeMod(`Happy.funTimes("fosho");`)
  const output = mod.transform.updateFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'nomo'
    }]
  ).toSource()
  expect(output).toBe(`Happy.funTimes("nomo");`)
})

test('remove all object.property function calls in the code', () => {
  const mod = new CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.transform.removeFunctionCall(
    'Happy', 'funTimes'
  ).toSource()
  expect(output).toBe(`
`)
})

test('remove function calls that perfectly match in code', () => {
  const mod = new CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.transform.removeFunctionCall(
    'Happy', 'funTimes', [{
      type: 'Literal', value: 'nomo'
    }]
  ).toSource()
  expect(output).toBe(`
Happy.funTimes("fosho")`)
})

test('get all matching function calls', () => {
  const mod = new CodeMod(`
Happy.funTimes("fosho")
Happy.funTimes("nomo")`)
  const output = mod.transform.getAllMatchingFunctionCalls(
    'Happy', 'funTimes'
  )
  expect(output).toEqual([{
    object: 'Happy',
    property: 'funTimes',
    args: [{
      type: 'Literal',
      value: 'fosho'
    }]
  }, {
    object: 'Happy',
    property: 'funTimes',
    args: [{
      type: 'Literal',
      value: 'nomo'
    }]
  }])
})
