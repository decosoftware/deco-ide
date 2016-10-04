import CodeMod from '../'

test('adds prop to jsx element', () => {
  const mod = CodeMod('<Buddy size={"bsdfig"} name={"gabe"}></Buddy>')
  // console.log(mod.toSource())
  const output = mod.addJSXAttribute(
    1, 'color', {type: 'Literal', value: 'red'}
  ).toSource()
  expect(output).toBe(`<Buddy color={"red"} size={"bsdfig"} name={"gabe"}></Buddy>`)
})

test('adds prop to jsx element with multiple component instances', () => {
  const mod = CodeMod(`<Buddy></Buddy>\n<Buddy/>\n<Buddy size={"bsdfig"} name={"gabe"}></Buddy>`)
  const output = mod.addJSXAttribute(
    3, 'color', {type: 'Literal', value: 'red'}
  ).toSource()
  expect(output).toBe(`<Buddy></Buddy>\n<Buddy/>\n<Buddy color={"red"} size={"bsdfig"} name={"gabe"}></Buddy>`)
})

test('adds prop to jsx element with newlines', () => {
  const mod = CodeMod('<Buddy \nsize={"bsdfasdfasdfasdfasdfasdfasdfasdffig"} \nname={"gabe"}\n></Buddy>')
  const output = mod.addJSXAttribute(
    1, 'color', {type: 'Literal', value: 'red'}
  ).toSource()
  expect(output).toBe(`<Buddy color={"red"} \nsize={"bsdfig"} \nname={"gabe"}\n></Buddy>`)
})

test('gets fucked', () => {
  const mod = CodeMod('<Buddy onClick={() => {\nconsole.log("hehe")}} name={"gabe"}\n></Buddy>')
  const output = mod.addJSXAttribute(
    1, 'color', {type: 'Literal', value: 'red'}
  ).toSource()
  expect(output).toBe(`<Buddy color={"red"} onClick={() => {\nconsole.log("hehe")}} name={"gabe"}\n></Buddy>`)
})

test('removes prop from jsx element', () => {
  const mod = CodeMod(`<Buddy></Buddy>\n<Buddy/>\n<Buddy size={"bsdfig"} color={"red"} name={"gabe"}></Buddy>`)
  const output = mod.removeJSXAttribute(3, 'color').toSource()
  expect(output).toBe(`<Buddy></Buddy>\n<Buddy/>\n<Buddy size={"bsdfig"} name={"gabe"}></Buddy>`)
})

test('removes prop from jsx element', () => {
  const mod = CodeMod(`<Buddy></Buddy>\n<Buddy/>\n<Buddy size={"bsdfig"} color={"red"} name={"gabe"}></Buddy>`)
  const output = mod.removeJSXAttribute(3, 'color').toSource()
  expect(output).toBe(`<Buddy></Buddy>\n<Buddy/>\n<Buddy size={"bsdfig"} name={"gabe"}></Buddy>`)
})

test('removes prop from jsx element with newlines', () => {
  const mod = CodeMod('<Buddy \nsize={"bsdfig"} \nname={"gabe"}></Buddy>')
  const output = mod.removeJSXAttribute(1, 'name').toSource()
  expect(output).toBe(`<Buddy \nsize={"bsdfig"} \n></Buddy>`)
})

test('update prop in jsx element', () => {
  const mod = CodeMod('<Buddy size={"bsdfig"} color={"green"} name={"gabe"}></Buddy>')
  const output = mod.updateJSXAttribute(
    1, 'color', {type: 'Literal', value: 'red'}
  ).toSource()
  expect(output).toBe('<Buddy size={"bsdfig"} color={"red"} name={"gabe"}></Buddy>')
})
