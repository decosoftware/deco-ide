import j from 'jscodeshift'
import * as ExpressionMethods from './expressionMethods'
import * as ImportMethods from './importMethods'

const enrichedJ = j.withParser('flow')

j.registerMethods(ExpressionMethods)
j.registerMethods(ImportMethods)

const codemod = (code) => enrichedJ(code)
module.exports = codemod
