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

class ASTUtils {

  //supports deconstructed requires and es6 imports
  static importASTtoString(ast) {
    const spacer = '  '
    let result = ''
    if (ast.body[0].type == 'ImportDeclaration') {
      result = 'import {\n'
      const defaultImports = _.filter(ast.body[0].specifiers, (specifier) => {
        return specifier.type == 'ImportDefaultSpecifier'
      })
      if (defaultImports.length > 0) {
        result = 'import ' + defaultImports[0].local.name + ', {\n'
      }
      _.each(ast.body[0].specifiers, (specifier) => {
        if (specifier.type != 'ImportDefaultSpecifier') {
          result += spacer + specifier.local.name + ',\n'
        }
      })
      result += '} from ' + ast.body[0].source.raw
    }
    if (ast.body[0].type == 'VariableDeclaration') {
      result = 'const {\n'
      _.each(ast.body[0].declarations[0].id.properties, (property) => {
        result += spacer + property.key.name + ',\n'
      })
      result += '} = require(' + ast.body[0].declarations[0].init.arguments[0].raw + ')'
    }
    return result
  }
}

export default ASTUtils
