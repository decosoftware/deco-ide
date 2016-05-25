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


// ${extendsName ? 'super()\n' : ''}

const createParamAssignment = (param) => {
  return `    this._${param} = ${param}`
}

const createGetter = (param) => {
  return `  get ${param}() {
    return this._${param}
  }`
}

const createSetter = (param) => {
  return `  set ${param}(value) {
    this._${param} = value
  }`
}

const createSerialization = (className, params) => {
  const code =
`
  /*** SERIALIZATION ***/

  toJSON() {
    return {
      ${params.map(param => `${param}: this._${param}`).join(',\n      ')},
    }
  }

  static fromJSON(json) {
    return new ${className}(
      ${params.map(param => `json.${param}`).join(',\n      ')}
    )
  }

  clone() {
    return ${className}.fromJSON(this.toJSON())
  }
`
  return code
}

const createClass = (className, extendsName, params) => {
  const code =
`import _ from 'lodash'

class ${className}${extendsName ? ' ' + extendsName : ''} {

  constructor(${params.join(', ')}) {
${params.map(createParamAssignment).join('\n')}
  }
${params.length ? '\n' : ''}${params.map(createGetter).join('\n\n')}${params.length ? '\n\n' : ''}${params.map(createSetter).join('\n\n')}${params.length ? '\n' : ''}${createSerialization(className, params)}
}

export default ${className}
`

  return code
}

const argv = process.argv
console.log(createClass(argv[2], null, argv.slice(3)))
