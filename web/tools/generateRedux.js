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

const path = require('path')
const fs = require('fs')
const readline = require('readline');

const BANNER = `/**
 *    Copyright (C) 2015 Deco Software Inat.
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

`

// Input validation

const root = path.join(__dirname, '../src/scripts')

const NAME = process.argv[2]
const ACTION_TYPES = process.argv.slice(3)

if (! NAME) {
  console.log('not enough arguments - need at least a name')
  process.exit()
}

// String utils

function capitalize(string) {
  return string.slice(0, 1).toUpperCase() + string.slice(1).toLowerCase()
}

function camelCase(string) {
  return string.toLowerCase().split('_').map((word, index) => {
    return index ? capitalize(word) : word
  }).join('')
}

// String builders

const createAction = (name, actionTypes) => {
  const createActionType = (actionType) => {
    return `  ${actionType}: '${actionType}',`
  }

  const createActionCreator = (actionType) => {
    return `
export const ${camelCase(actionType)} = () => async (dispatch) => {
  dispatch({type: at.${actionType}})
}
`.slice(1)
  }

  return `
export const at = {
${actionTypes.map(createActionType).join('\n')}
}

${actionTypes.map(createActionCreator).join('\n')}`.slice(1)
}

const createReducer = (name, actionTypes) => {
  const createReducerCase = (actionType) => {
    return `
    case at.${actionType}: {
      return {...state}
    }
`.slice(1)
  }

  return `
import { ${name}Constants as at } from '../actions'

const initialState = {}

export default (state = initialState, action) => {
  const {type, payload} = action

  switch(type) {
${actionTypes.map(createReducerCase).join('\n')}
    default: {
      return state
    }
  }
}
`
}

const createActionCombiner = (name) => {
  return `export * as ${name}Actions, { at as ${name}Constants } from './${name}Actions'\n`
}

const createReducerCombiner = (name) => {
  return `import ${name} from './${name}Reducer'\n`
}

// Files to write

const files = [
  {dir: 'actions', filename: `${NAME}Actions.js`, text: BANNER + createAction(NAME, ACTION_TYPES), mode: 'write'},
  {dir: 'reducers', filename: `${NAME}Reducer.js`, text: BANNER + createReducer(NAME, ACTION_TYPES), mode: 'write'},
  {dir: 'actions', filename: `index.js`, text: createActionCombiner(NAME), mode: 'append'},
  {dir: 'reducers', filename: `index.js`, text: createReducerCombiner(NAME), mode: 'append'},
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const write = (file) => {
  const {dir, filename, text, mode} = file
  const filepath = path.join(root, dir, filename)

  switch (mode) {
    case 'write': {
      fs.writeFileSync(filepath, text)
      break
    }

    case 'append': {
      fs.appendFileSync(filepath, text)
      break
    }
  }
}

const promptAndWrite = (files, index) => {
  const file = files[index]

  if (file) {
    const {dir, filename, text, mode} = file
    const filepath = path.join(root, dir, filename)

    console.log(`--- ${filepath} ---`)
    console.log(text)

    rl.question(`${capitalize(mode)}?\n`, (answer) => {
      if (answer.startsWith('y')) {
        write(file)
      }

      promptAndWrite(files, index + 1)
    })
  } else {
    rl.close()
  }
}

promptAndWrite(files, 0)
