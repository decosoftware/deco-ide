import CodeMod from '../'

test('exports an exression into code', () => {
  const mod = CodeMod(`import { SceneManager, Navigational, Adapters } from 'deco-sdk'
  Navigational.registerAdapter(Adapters.NavigatorIOSAdapter)

  import Scene1 from './Scene1'
  SceneManager.registerScene('Scene1', Scene1)`).addExport(true, {
    type: 'CallExpression',
    expression: [
      'SceneManager',
      'registerEntryScene',
      [{
        type: 'Literal',
        value: 'Scene1',
      }]
    ]
  })
  const output = mod.toSource()
  expect(output).toBe(`import { SceneManager, Navigational, Adapters } from 'deco-sdk'
Navigational.registerAdapter(Adapters.NavigatorIOSAdapter)

import Scene1 from './Scene1'
SceneManager.registerScene('Scene1', Scene1)
export default SceneManager.registerEntryScene("Scene1");`)
})

test('remove exports from code', () => {
  const mod = CodeMod(`import { SceneManager, Navigational, Adapters } from 'deco-sdk'
  Navigational.registerAdapter(Adapters.NavigatorIOSAdapter)

  import Scene1 from './Scene1'
  SceneManager.registerScene('Scene1', Scene1)
  export default SceneManager.registerEntryScene("Scene1");`).removeExports()
  const output = mod.toSource()
  expect(output).toBe(`import { SceneManager, Navigational, Adapters } from 'deco-sdk'
Navigational.registerAdapter(Adapters.NavigatorIOSAdapter)

import Scene1 from './Scene1'
SceneManager.registerScene('Scene1', Scene1)`)
})
