import _ from 'lodash'
const CodeMod = Electron.remote.require('./utils/codemod/index.js')

/**
 * Parses the imports and the specifiers in the storyboard file
 * to return a list of filepaths to load in with their respective
 * scene code
 *
 */
export const getFilePathsFromStoryboardCode = (code) => {
  const scenes = {}
  CodeMod(code).getAllImports()
    .filter((_import) => _import.source != 'deco-sdk')
    .forEach((sceneImport) => {
      const filepath = _.get(sceneImport, 'source')
      scenes[filepath] = {
        sceneName: _.get(sceneImport, 'identifiers[0].value'),
        source: filepath,
      }
    })
  return scenes
}

/**
 * Takes thes scene code and looks for the push and the pops
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 */
export const getConnectionsInCode = (code) => {
  const mod = CodeMod(code)
  const pushes = mod.getAllMatchingFunctionCalls(
    'NavigatorActions',
    'push'
  )
  const pops = mod.getAllMatchingFunctionCalls(
    'NavigatorActions',
    'pop'
  )
  const connectionsTo = pushes.map(({args, source}) => ({
    source,
    to: _.get(args, '[0].value')
  }))
  const connectionsPop = pops.map(({args, source}) => ({
    source,
  }))
  return {
    connections: {
      pushes: connectionsTo,
      pops: connectionsPop
    }
  }
}

/**
 * Returns an object of scenes, sceneNames, entryScene, whatever
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 */
export const getSceneInformationForStoryboardCode = (code) => {
  const mod = new CodeMod(code)
  const entryCall = mod.getAllMatchingFunctionCalls(
    'SceneManager',
    'registerEntryScene'
  )
  const entryScene = _.get(entryCall, '[0].args[0].value')
  const scenes = {}
  mod.getAllMatchingFunctionCalls(
    'SceneManger',
    'registerScene'
  ).forEach((sceneCall) => {
    const sceneName = _.get(sceneCall, 'args[1].value')
    scenes[sceneName] = {
      id: sceneName,
      name: sceneName,
    }
  })
  return {
    entry: entryScene,
    scenes,
  }
}
