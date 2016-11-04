import j from 'jscodeshift'
import _ from 'lodash'
import {
  createArgumentNodes,
  inverseCreateArgumentNodes,
  createCallExpression,
  createExpressionStatement,
  findCommentMarker,
  addNodeAtIndex,
  addCommentsToNodeIndex,
} from './helpers'

const getObject = (node) => (
  _.get(node, 'callee.object.name') || _.get(node, 'value.callee.object.name')
)
const getProperty = (node) => (
  _.get(node, 'callee.property.name') || _.get(node, 'value.callee.property.name')
)
const getArgs = (node) => _.get(node, 'arguments') || _.get(node, 'value.arguments')
const getSourceLocation = (node) => {
  let loc = _.get(node, 'loc') || _.get(node, 'value.loc')
  if (loc == null) {
    loc = _.get(node, 'parentPath.value.loc')
  }
  return {
    start: loc && loc.start,
    end: loc && loc.end,
  }
}
const getSimilarity = (node, object, property, args = []) => {
  let sameArgs = args.length == 0
  args = args || []
  const sameObject = getObject(node) == object
  const sameProperty = getProperty(node) == property
  if (!sameArgs) {
    sameArgs = getArgs(node).reduce((sameSoFar, node, i) => {
      if (!sameSoFar) return false
      return args.length > i ? nodeHasValue(node, args[i].value) : false
    }, true)
  }
  const obj = getObject(node)
  const prop = getProperty(node)
  const argu = getArgs(node)

  return { sameObject, sameProperty, sameArgs, }
}

/**
 * Finds the last call to a particular function object.property in
 * an ast, and returns the range of that last call
 */
const getLastMatchingExpressionRange = (ast, object, property) => {
  const matchingExpressions = ast.find(j.ExpressionStatement).paths().filter((node) => {
    const {sameObject, sameProperty, } = getSimilarity(
      node.value.expression, object, property
    )
    return (sameObject && sameProperty)
  })
  if (matchingExpressions.length === 0) return null
  return matchingExpressions[matchingExpressions.length - 1].value.range
}

const nodeHasValue = (node, value) => {
  switch (node.type) {
    case 'Literal': {
      return _.get(node, 'value') == value
    }
    case 'Identifier': {
      return _.get(node, 'name') == value
    }
    default: {
      return false
    }
  }
}

/**
 * Adds a function call as 'object.property(...args)'
 * immediately after the last call of the same function,
 * or at the top of the file if there isn't another call.
 *
 * @param  {String} object   Name of the object to call function on
 * @param  {String} property Name of the function on object to call
 * @param  {Array} args      List of Objects { type: 'Literal'|'Identifier', value: String }
 *                           if args is missing then it is a function call without arguments
 * @return {Collection}      Updated Collection
 */
export const addFunctionCall = function(object, property, args, options = {}) {
  const rangeOfLastMatching = getLastMatchingExpressionRange(this, object, property)
  const body = _.get(this.nodes(), '[0].program.body')
  // Let's do this the correct way with insertBefore, etc and
  // generally smarter logic on all these inserts
  let newFunctionIndex = body.length - 1

  // least precedent
  if (rangeOfLastMatching) {
    newFunctionIndex = _.map(body, 'range').indexOf(rangeOfLastMatching) + 1
  }
  // next highest precedence
  if (options.afterCommentMatching) {
    newFunctionIndex = findCommentMarker(body, options.afterCommentMatching)
  }
  // highest precedence
  if (options.appendToBody) {
    newFunctionIndex = body.length
  }

  const node = createExpressionStatement(object, property, args)
  if (options.withComment) {
    node.comments = [j.commentLine(options.withComment.value, options.withComment.leading || true)]
  }
  addNodeAtIndex(body, node, newFunctionIndex)
  return this
}

/**
 * Updates the arguments of a function who matches on 'object.property'
 * @param Same as addFunctionCall
 * @return {Collection}      Updated Collection
 */
export const updateFunctionCall = function(object, property, args) {
  this.find(j.CallExpression).paths().filter((node) => {
    const {sameObject, sameProperty, } = getSimilarity(
      node, object, property, args
    )
    return (sameObject && sameProperty)
  }).map((node) => {
    _.set(node, 'value.arguments', createArgumentNodes(args))
  })
  return this
}

/**
 * Removes all functions that exactly match the description of 'object.property(...args)'
 * If args is undefined, it matches only on 'object.property'
 *
 * @param Same as addFunctionCall
 * @return Same as addFunctionCall
 */
export const removeFunctionCall = function(object, property, args, options = {}) {
  const program = _.get(this.nodes(), '[0].program', {})
  let comments = []
  let earliestFilteredIndex = -1
  if (program.body) {
    program.body = program.body.filter((node, i) => {
      if (node.type == 'ExpressionStatement') {
        const { sameObject, sameProperty, sameArgs, } = getSimilarity(
          node.expression, object, property, args
        )
        const keepNode = (!sameObject || !sameProperty || !sameArgs)

        if (options.preserveComments && !keepNode) {
          if (earliestFilteredIndex < 0) earliestFilteredIndex = i
          comments = comments.concat(node.comments || [])
        }
        return keepNode
      }
      return true
    })

    addCommentsToNodeIndex(program.body, earliestFilteredIndex, comments)
  }

  return this
}

/**
 * Gets a list of all function calls matching on 'object.property(..args)'
 * If args is undefined, it matches only on 'object.property'
 * @param Same as addFunctionCall
 * @return {Array}  of type
 * [{
 * 	object: {String},
 * 	property: {String},
 *  source: { start: { line, column }, end: { line, column }}
 * 	args: [{
 * 	  // Format for type MemberExpression
 * 		type: 'MemberExpression',
 * 		object: {String},
 * 		property: {String},
 * 		args: {Array} (of same type of args)
 * 	}, {
 * 		// Format for type Identifier
 * 		type: 'Identifier',
 * 		value: {String}
 * 	}, {
 * 		// Format for type Literal
 *   	type: 'Literal',
 *   	value: {String}
 * 	}, {
 * 	...
 * 	}]
 * }]
 */
export const getAllMatchingFunctionCalls = function(object, property, args) {
  return this.find(j.CallExpression).paths().filter((node) => {
    const {sameObject, sameProperty, sameArgs, } = getSimilarity(
      node, object, property, args
    )
    return (sameObject && sameProperty && sameArgs)
  }).map((node) => {
    return {
      object: getObject(node),
      property: getProperty(node),
      source: getSourceLocation(node),
      args: inverseCreateArgumentNodes(getArgs(node)),
    }
  })
}
