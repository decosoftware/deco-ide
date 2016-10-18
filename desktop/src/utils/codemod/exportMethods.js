import j from 'jscodeshift'
import _ from 'lodash'
import { createArgumentNodes } from './helpers'

const getProgram = (ast) => {
  if (ast.nodes().length == 0 || !_.get(ast.nodes(), '[0].program')) {
    return
  }
  return _.get(ast.nodes(), '[0].program', {})
}

const createExportDeclaration = (asDefault, args) => (
  j.exportDeclaration(asDefault, createArgumentNodes([args])[0])
)

/**
 * Adds an export to the file with a given expression
 * @param  {[type]} asDefault  [description]
 * @param  {[type]} expression [description]
 * @return {[type]}            [description]
 */
export const addExport = function(asDefault, args) {
  const body = _.get(this.nodes(), '[0].program.body')
  if (body) {
    body.push(createExportDeclaration(asDefault, args))
  }
  return this
}

export const removeExports = function() {
  const program = getProgram(this)
  if (program.body) {
    program.body = program.body.filter((node) => {
      return (node.type !== 'ExportDeclaration')
    })
  }
  return this
}
