import j from 'jscodeshift'
import * as ExpressionMethods from './expressionMethods'
import * as ImportMethods from './importMethods'
import * as JSXMethods from './JSXMethods'

const enrichedJ = j.withParser('flow')

j.registerMethods(ExpressionMethods)
j.registerMethods(ImportMethods)
j.registerMethods(JSXMethods)

const codemod = (code) => enrichedJ(code)
module.exports = codemod
