/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import _ from 'lodash'
import esprima from 'esprima'

import ASTUtils from '../ASTUtils'
import DecoChangeFactory from '../../factories/editor/DecoChangeFactory'
import CodeMirrorChange from '../../models/editor/CodeMirrorChange'
import DecoTextChange from '../../models/editor/DecoTextChange'
import DecoRange from '../../models/editor/DecoRange'
import Pos from '../../models/editor/CodeMirrorPos'
import uuid from '../uuid'

const REQ_REGEX = /(?:(?:var|const)\s*(.*?)\s*=\s*)?require\(['"]([^'"]+)['"](?:, ['"]([^'"]+)['"])?\);?/g
const ES6_IMPORT_REGEX = /\bimport\s+(?:.+\s+from\s+)?[\'"]([^"\']+)["\']/g;

const makeDataFromComponent = (ch, text) => {
  let spacing = ''
  for (var i = 0; i < ch; i++) {
    spacing += ' '
  }
  return _.map(text.split('\n'), (line, i) => {
    if (i == 0) {
      return line
    }
    return spacing + line
  })
}

const findImportRange = (importName, cmDoc) => {
  let amInImportBlock = false
  let amInBlock = false
  let fromLine = -1
  let toLine = -1
  const lineCount = cmDoc.lineCount()
  const importNameRE = new RegExp(`['"]${importName}['"]`)
  for (var i = 0; (i < lineCount && toLine === -1); i++) {
    const lineValue = cmDoc.getLine(i)
    if (lineValue.match('import ')) {
      if (lineValue.match('{')) {
        amInImportBlock = true
        fromLine = i
      } else if (lineValue.match('from') && lineValue.match(importNameRE)) {
        fromLine = i
        toLine = i
        break
      }
    }
    if (lineValue.match('} from ')) {
      if (amInImportBlock) {
        if (lineValue.match(importNameRE)) {
          toLine = i
        }
        amInImportBlock = false
      }
    }
    if (lineValue.match('{')) {
      amInBlock = true
      if (!amInImportBlock) {
        fromLine = i
      }
    }
    if (lineValue.match('require')) {
      if (amInBlock && lineValue.match(importNameRE)) {
        toLine = i
      }
    }
    if (lineValue.match('}')) {
      if (amInBlock) {
        amInBlock = false
      }
    }
  }
  //the top module doesnt exist so well create it fresh
  let parentModuleDoesNotExist = false
  if (toLine < 0) {
    parentModuleDoesNotExist = true
    fromLine = 0 //put require at the top
  }

  return {
    foundParent: !parentModuleDoesNotExist,
    fromLine,
    toLine,
  }
}

const transformImportRange = (text, namesToRequire) => {
  try {
    const parsed = esprima.parse(text, {sourceType: 'module'})
    _.each(namesToRequire, (nameToRequire) => {
      let alreadyExists = false
      //this is the new es6 import format
      if (parsed.body[0].type == 'ImportDeclaration') {
        _.each(parsed.body[0].specifiers, (specifier) => {
          if (specifier.local.name == nameToRequire) {
            alreadyExists = true
          }
        })
        if (!alreadyExists) {
          parsed.body[0].specifiers.push({
            type: 'ImportSpecifier',
            local: {
              type: 'Identifier',
              name: nameToRequire,
            }, imported: {
              type: 'Identifier',
              name: nameToRequire,
            }
          })
        }
      }
      //assuming it's a deconstructed require statement
      if (parsed.body[0].type == 'VariableDeclaration') {
        _.each(parsed.body[0].declarations[0].id.properties, (property) => {
          if (property.key.name == nameToRequire) {
            alreadyExists = true
          }
        })
        if (!alreadyExists) {
          parsed.body[0].declarations[0].id.properties.push({
            type: 'Property',
            key: { type: 'Identifier', name: 'View' },
            computed: false,
            value: { type: 'Identifier', name: 'View' },
            kind: 'init',
            method: false,
            shorthand: true,
          })
        }
      }
    })
    return ASTUtils.importASTtoString(parsed)
  } catch(e) {
    return null
  }
  return text
}

const insertRequireAtTop = (importName, importValues, cmDoc) => {
  const { fromLine, toLine, foundParent } = findImportRange(importName, cmDoc)
  let pos = { line: fromLine, ch: 0 }
  let importText
  if (_.isArray(importValues)) {
    importText = `import { ${importValues.join(', ')} } from '${importName}'\n`
  } else {
    importText = `import ${importValues} from '${importName}'\n`
  }
  let importChange = new CodeMirrorChange(pos, pos, importText, [''])

  if (foundParent) {

    // If importValues is a string, it is the default require, so do nothing
    if (_.isString(importValues)) {
      return null
    }

    const endPos = {
      line: toLine,
      ch: 100000000 //just hit the end of the line
    }
    const oldText = cmDoc.getRange(pos, endPos)
    //TODO: this format is strange, so it definitely needs to be thought out more thoroughly
    const newText = transformImportRange(oldText, importValues)
    //something went wrong if newText is null, so we're going to just stupidly import
    if (newText) {
      importChange = new CodeMirrorChange(pos, endPos, newText.split('\n'), oldText.split('\n'))
    }
  }

  return new DecoTextChange(importChange)
}

const insertComponentAtCursor = (text, cmDoc, newDecoRanges) => {
  const selection = cmDoc.listSelections()[0]
  const selectionFrom = selection.from()
  const selectionTo = selection.to()

  const cmDeleteSelection = new CodeMirrorChange(
    selectionFrom,
    selectionTo,
    [''],
    cmDoc.getRange(selectionFrom, selectionTo)
  )

  const shiftedDecoRanges = _.map(newDecoRanges, (decoRange) => {
    return new DecoRange(
      decoRange.id,
      new Pos(decoRange.from.line + selectionFrom.line, decoRange.from.ch + selectionFrom.ch),
      new Pos(decoRange.to.line + selectionFrom.line, decoRange.to.ch + selectionFrom.ch)
    )
  })

  const componentScaffold = makeDataFromComponent(selectionFrom.ch, text)

  const cmChange = new CodeMirrorChange(selectionFrom, selectionFrom, componentScaffold, [''])

  return DecoChangeFactory.createCompositeChange([
    new DecoTextChange(cmDeleteSelection),
    new DecoTextChange(cmChange),
  ].concat(_.map(shiftedDecoRanges, (decoRange) => {
      return DecoChangeFactory.createChangeToAddDecoRange(decoRange)
  })))
}

class DecoComponentUtils {
  static createChangeToInsertImport(decoDoc, importKey, importValue) {
    return insertRequireAtTop(
      importKey,
      importValue,
      decoDoc.cmDoc
    )
  }

  static createChangeToInsertTemplate(decoDoc, linkedDocId, text, decoRanges) {
    return insertComponentAtCursor(text, decoDoc.findLinkedDocById(linkedDocId), decoRanges)
  }

  static createChangeToInsertComponent(componentInfo, metadata, decoDoc, newDecoRanges) {
    metadata = _.cloneDeep(metadata)
    const componentChange = insertComponentAtCursor(metadata.template, decoDoc.cmDoc, newDecoRanges)
    const requireChange = insertRequireAtTop(
      metadata.parentModule,
      metadata.dependencies[metadata.parentModule],
      decoDoc.cmDoc
    )
    if (!requireChange) {
      return componentChange //the require already exists, so this is not a composite change
    }
    const fullChange = DecoChangeFactory.createCompositeChange([
      componentChange,
      requireChange,
    ])
    return fullChange
  }
}

export default DecoComponentUtils
