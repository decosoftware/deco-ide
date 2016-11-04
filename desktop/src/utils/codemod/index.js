import j from 'jscodeshift'
import * as ExpressionMethods from './expressionMethods'
import * as ImportMethods from './importMethods'
import * as ExportMethods from './exportMethods'

const enrichedJ = j.withParser('flow')

j.registerMethods(ExpressionMethods)
j.registerMethods(ImportMethods)
j.registerMethods(ExportMethods)

const codemod = (code) => enrichedJ(code)

codemod.getAST = (code) => new Promise((resolve) => {

  // Ensure parsing happens after control returns to the browser
  process.nextTick(() => {
    const ast = enrichedJ(code).nodes()

    // Stringify the AST, since objects passed via Electron have too much
    // overhead for the massive AST object
    const astString = JSON.stringify(ast)

    resolve(astString)
  })
})

module.exports = codemod
