import _ from 'lodash'
import ElementTreeBuilder from '../ElementTreeBuilder'
const CodeMod = Electron.remote.require('./utils/codemod/index.js')
const path = Electron.remote.require('path')

/**
 * Takes a relative path from an import and, optionally, a root
 * directory path. Returns an absolute file path.
 * './Buddy' -> 'Buddy.js' or '/Users/gabe/Code/Buddy.js'
 */
const formatFilePaths = (filepath, options = {}) => {
  let formedPath = filepath
  if (formedPath.indexOf('./') != -1) {
    formedPath = formedPath.slice(2)
  }
  if (formedPath.indexOf('.js') == -1) {
    if (formedPath[formedPath.length - 1] == '/') {
      formedPath = formedPath.slice(0, formedPath.length - 1)
    }
    formedPath += '.js'
  }

  return options.directoryPath ? path.join(options.directoryPath, formedPath) : formedPath
}

/**
 * Parses the imports and the specifiers in the storyboard file
 * to return a list of filepaths to load in with their respective
 * scene code
 */
export const getFilePathsFromStoryboardCode = (code, options) => {
  const scenes = {}
  CodeMod(code).getAllImports()
    .filter((_import) => _import.source != 'deco-sdk')
    .forEach((sceneImport) => {
      const filepath = _.get(sceneImport, 'source')
      const formattedPath = formatFilePaths(filepath, options)
      scenes[formattedPath] = {
        sceneName: _.get(sceneImport, 'identifiers[0].value'),
        source: formattedPath,
      }
    })
  return scenes
}

/**
 * Takes thes scene code and looks for the push and the pops
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
    pushes: connectionsTo,
    pops: connectionsPop
  }
}

export const buildElementTree = (code) => {
  const elementTree = ElementTreeBuilder.elementTreeFromAST(CodeMod(code).nodes())
}

/**
 * Returns an object of scenes, sceneNames, entryScene, whatever
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
    'SceneManager',
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
