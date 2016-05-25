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
import babel from '../../../node_modules/babel-core/browser'

import Pos from '../models/editor/CodeMirrorPos'
import PrimitiveTypes from '../constants/PrimitiveTypes'

// Could use babel, but babel takes ~3ms, and we may do this
// very frequently. This approach takes ~0.02ms
export const toValue = _.memoize((code) => {
  if (code[0] === "'") {
    code = '"' + code.slice(1, -1) + '"'
    // TODO handle unescaped quotes, or perhaps use Babel
  }

  try {
    return JSON.parse(code)
  } catch (e) {
    return null
  }
})

export const toCode = _.memoize((value) => {
  return JSON.stringify(value)
})

export const transform = (code) => {
  return babel.transform(code).code
}

export const getType = _.memoize((code) => {
  let tranformation

  try {
    tranformation = babel.transform(code, { code: false })
  } catch (e) {
    return null
  }

  const tokens = tranformation.ast.tokens
  if (tokens.length === 2) {
    switch (tokens[0].type.label) {
      case 'num':
        return PrimitiveTypes.NUMBER
      break
      case 'string':
        return PrimitiveTypes.STRING
      break
      case 'true':
      case 'false':
        return PrimitiveTypes.BOOLEAN
      break
    }
  } else if (tokens.length === 3 &&
      tokens[0].value === '-' && tokens[1].type.label === 'num') {
    return PrimitiveTypes.NUMBER
  }

  return null
})

export const guessValueName = (text) => {
  const match = text.match(/(\w+)\s*[=:]\s*\{?\s*$/)
  return match ? match[1] : null
}
