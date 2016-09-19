import j from 'jscodeshift'
import * as ExpressionMethods from './expressionMethods'
import * as ImportMethods from './importMethods'

j.registerMethods(ExpressionMethods)
j.registerMethods(ImportMethods)

class CodeMod {
  constructor(code) {
    this._ast = j(code)
  }
  get transform() {
    return this._ast
  }
  set code(code) {
    this._ast = j(code)
  }
  get code() {
    return this._ast.toSource()
  }
}

export default CodeMod
