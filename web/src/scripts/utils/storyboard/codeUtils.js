import _ from 'lodash'
import ElementTreeBuilder from '../ElementTreeBuilder'
const CodeMod = Electron.remote.require('./utils/codemod/index.js')

/**
 * Takes a name or relative path and returns a relative path with a .js extension
 * './Buddy' -> 'Buddy.js' or '/Users/gabe/Code/Buddy.js'
 */
const relativize = (filepath) => {
  let formedPath = filepath

  // Strip './' if present
  if (formedPath.startsWith('./')) {
    formedPath = formedPath.slice(2)
  }

  // If no .js ending
  if (formedPath.indexOf('.js') === -1) {

    // Remove an ending '/' if present
    if (formedPath.endsWith('/')) {
      formedPath = formedPath.slice(0, -1)
    }

    // Add the .js extension
    formedPath += '.js'
  }

  return formedPath
}

/**
 * Parses the imports and the specifiers in the storyboard file
 * to return a list of filepaths to load in with their respective
 * scene code
 */
export const getFilePathsFromStoryboardCode = (code) => {
  return CodeMod(code).getAllImports()
    .filter((_import) => _import.source != 'deco-sdk')
    .map((sceneImport) => ({
      name: _.get(sceneImport, 'identifiers[0].value'),
      source: relativize(sceneImport.source),
    }))
}

/**
 * Takes the scene code and looks for the push and the pops
 */
export const getConnectionsInCode = (code) => {
  const mod = CodeMod(code)

  const pushCalls = mod.getAllMatchingFunctionCalls('NavigatorActions', 'push')
  const popCalls = mod.getAllMatchingFunctionCalls('NavigatorActions', 'pop')

  const pushes = pushCalls.map(({args, source}) => ({
    type: 'push',
    source,
    to: _.get(args, '[0].value')
  }))

  const pops = popCalls.map(({args, source}) => ({
    type: 'pop',
    source,
  }))

  return [...pushes, ...pops]
}

export const buildElementTree = (code) => {
  const elementTree = ElementTreeBuilder.elementTreeFromAST(CodeMod(code).nodes())
}

/**
 * Returns an object of scenes, sceneNames, entryScene, whatever
 */
export const getSceneInformationForStoryboardCode = (code) => {
  const mod = new CodeMod(code)

  const entryCall = mod.getAllMatchingFunctionCalls('SceneManager', 'registerEntryScene')
  const entryName = _.get(entryCall, '[0].args[0].value')

  const scenes = mod
    .getAllMatchingFunctionCalls('SceneManager', 'registerScene')
    .map((sceneCall) => _.get(sceneCall, 'args[1].value'))

  return {entry: entryName, scenes}
}
