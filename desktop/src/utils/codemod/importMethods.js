import j from 'jscodeshift'
import _ from 'lodash'
import { addNodeAtIndex, addCommentsToNodeIndex } from './helpers'

const getProgram = (ast) => {
  if (ast.nodes().length == 0 || !_.get(ast.nodes(), '[0].program')) {
    return
  }
  return _.get(ast.nodes(), '[0].program', {})
}

const getNodeForImport = (ast, importSource) => {
  const filtered = ast.find(j.ImportDeclaration).filter((node) => (
    _.get(node, 'value.source.value') == importSource
  ))
  const nodePaths = filtered.paths()
  if (nodePaths.length != 0) {
    return nodePaths[0] //return the first node,
  }
  return null
}

/**
 * Finds the last import in an ast, and returns the range of
 * that last import
 */
const getLastImportRange = (ast) => {
  const imports = ast.find(j.ImportDeclaration).nodes()
  if (imports.length === 0) return null
  const lastImport = imports[imports.length - 1]
  return lastImport.range
}

const createImportSpecifier = (type, value) => {
  switch (type) {
    case 'Default': {
      return j.importDefaultSpecifier(j.identifier(value))
    }
    case 'Named': {
      return j.importSpecifier(j.identifier(value))
    }
    default: {
      throw Error('Unrecognized specifier in codemod')
    }
  }
}

const createImportDeclaration = (defaultImport, namedImports, importSource) => {
  const importSpecifiers = []
  if (defaultImport) {
    importSpecifiers.push(createImportSpecifier('Default', defaultImport))
  }
  _.forEach(namedImports, (namedImport) => {
    importSpecifiers.push(createImportSpecifier('Named', namedImport))
  })
  return j.importDeclaration(importSpecifiers, j.literal(importSource))
}

/**
 * Adds an import to the top of the AST's program body
 * If this particular import already exists, nothing happens.
 *
 * @param  {String} defaultImport      name of the defaultImport variable
 * @param  {Array[String]} namedImports       list of names of the namedImport variables
 * @param  {String} importSource string to use for import source
 * @return {Collection}                    Updated Collection object
 */
export const addImport = function(defaultImport, namedImports, importSource) {
  // make sure the import does not already exist
  let node = getNodeForImport(this, importSource)
  if (!node) {
    const lastImportRange = getLastImportRange(this)
    const body = _.get(this.nodes(), '[0].program.body')
    node = createImportDeclaration(defaultImport, namedImports, importSource)
    addNodeAtIndex(body, node, 0)
  }
  return this
}

/**
 * Updates the import statement whose importSource matches
 *
 * @param  Same as addImport
 * @return {Collection}                    Updated Collection object
 */
export const updateImport = function(defaultImport, namedImports, importSource) {
  const program = getProgram(this)
  if (program.body) {
    program.body = program.body.map((node) => {
      if (node.type == 'ImportDeclaration' &&
          node.source.value == importSource) {
          return createImportDeclaration(defaultImport, namedImports, importSource)
      } else {
        return node
      }
    })
  }
  return this
}

/**
 * Removes any import statements that use the importSource
 *
 * @param  {String} importSource string to use for import source
 * @return {Collection}                    Updated Collection object
 */
export const removeImport = function(importSource, options = {}) {
  const program = getProgram(this)
  let comments = []
  let earliestFilteredIndex = -1
  if (program.body) {
    program.body = program.body.filter((node, i) => {
      const keepNode = (node.type !== 'ImportDeclaration' ||
              node.source.value !== importSource)
      if (!keepNode && options.preserveComments) {
        if (earliestFilteredIndex < 0) earliestFilteredIndex = i
        comments = comments.concat(node.comments || [])
      }
      return keepNode
    })
  }
  addCommentsToNodeIndex(program.body, earliestFilteredIndex, comments)
  return this
}

/**
 * Updates a require statement whose variable name (identifier) matches
 * @param  {String} identifier   name of the assigned variable from require
 * @param  {String} importSource value of the import source
 * @return {Collection}                    Updated Collection object
 */

export const updateImportSourceForRequire = function(identifier, importSource) {
  const entryNode = this.find(j.VariableDeclaration).filter((node) => (
    _.get(node, 'value.declarations[0].id.name') == identifier
  ))
  const node = _.get(entryNode.paths(), '[0].value')
  _.set(node, 'declarations[0].init.arguments[0]', j.literal(importSource))
  return this
}



/**
 * Return the default variable used for that import source from program body
 *
 * @param  {String} importSource the value of the import source
 * @return {String}  Name of the default import or null if no import is found
 */
export const defaultImportForSource = function(importSource) {
  const node = getNodeForImport(this, importSource)
  if (node) {
    return _.get(node, 'value.specifiers[0].id.name')
  }
  return null
}

/**
 * Return a list of all requires in the code
 * @return {Array}  of form
 * [{
 * 	kind: 'let' | 'const' | 'var',
 * 	require: {
 * 		identifier: {String}
 * 		source: {String}
 * 	}
 * }, {
 * 	...
 * }]
 */
export const getAllRequires = function() {
  const program = getProgram(this)
  if (program.body) {
    return program.body
      .filter((node) => node.type == 'VariableDeclaration')
      .filter((node) => (
        node.declarations.length == 1 &&
        _.get(node, 'declarations[0].init.callee.name') == 'require'
      )).map((node) => {
        const kind = node.kind
        const requires = node.declarations.map((dec) => {
          const identifier = _.get(dec, 'id.name')
          const source = _.get(dec, 'init.arguments[0].value')
          return {
            identifier,
            source,
          }
        })
        return {
          kind,
          require: requires.length > 0 ? requires[0] : [],
        }
      })
  }
  return []
}

/**
 * Get all es6 imports in a file
 * @return {Array}  of form
 * [{
 * 	identifiers: [
 * 		{
 * 			kind: 'Default' | 'Named'
 * 		 	value: {String}
 * 		}, {...}],
 * 	source: {String}
 * }, {
 * ...
 * }]
 */

export const getAllImports = function() {
  const program = getProgram(this)
  if (program.body) {
    return program.body
      .filter((node) => {
        return node.type == 'ImportDeclaration'
      }).map((node) => {
        const identifiers = node.specifiers.map((spec) => {
          const kind = spec.type == 'ImportDefaultSpecifier' ? 'Default' : 'Named'
          return {
            kind,
            value: _.get(spec, 'id.name'),
          }
        })
        const source = _.get(node, 'source.value')
        return {
          identifiers,
          source,
        }
      })
  }
  return []
}
