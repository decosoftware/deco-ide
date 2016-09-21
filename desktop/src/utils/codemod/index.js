import j from 'jscodeshift'
import * as ExpressionMethods from './expressionMethods'
import * as ImportMethods from './importMethods'

j.registerMethods(ExpressionMethods)
j.registerMethods(ImportMethods)

const codemod = (code) => j(code)
module.exports = codemod
