import _ from 'lodash'

export const addScene = (mod, sceneName, relativePath) => {
  mod.addImport(sceneName, [], relativePath)
  if (mod.getAllMatchingFunctionCalls(
    'SceneManager',
    'registerScene'
  ).length == 0) {
    mod.addFunctionCall(
      'SceneManager',
      'registerScene',
      [
        {type: 'Literal', value: sceneName},
        {type: 'Identifier', value: sceneName}
      ],
      {
        appendToBody: true,
        withComment: {
          value: 'registerScenes',
          leading: true,
        }
      }
    )
    updateEntryScene(mod, sceneName)
  } else {
    mod.addFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', value: sceneName}
        ],
        {
          afterCommentMatching: 'registerScenes'
        }
      )
  }
  return mod
}

export const removeScene = (mod, sceneName, relativePath) => {
  mod.removeImport(relativePath, {
    preserveComments: true,
  })
  const scenesRemaining = mod.getAllMatchingFunctionCalls(
    'SceneManager',
    'registerScene'
  ).length
  //remove comment marker if this is the last comment
  const preserveComments = scenesRemaining > 1
  const removeEntryScene = scenesRemaining == 1

  mod.removeFunctionCall(
      'SceneManager',
      'registerScene',
      [
        {type: 'Literal', value: sceneName},
        {type: 'Identifier', value: sceneName},
      ],
      { preserveComments, }
    )

  if (removeEntryScene) {
    mod.removeFunctionCall(
      'SceneManager',
      'registerEntryScene'
    )
  }
}

export const updateEntryScene = (mod, sceneName) => {
  mod.removeExports()
  .removeFunctionCall(
    'SceneManager',
    'registerEntryScene'
  )
  .addFunctionCall(
    'SceneManager',
    'registerEntryScene',
    [{
      type: 'Literal',
      value: sceneName,
    }],
    { appendToBody: true, }
  )
  .addExport(true, {
    type: 'CallExpression',
    expression: [
      'SceneManager',
      'getEntryScene',
      []
    ]
  })
}
