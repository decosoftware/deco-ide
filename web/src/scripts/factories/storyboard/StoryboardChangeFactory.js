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

import DecoChangeFactory from '../editor/DecoChangeFactory'
const CodeMod = Electron.remote.require('./utils/codemod/index.js')

const createChange = (doc, mod) => (
  DecoChangeFactory.createChangeToReplaceAllText(doc, mod.toSource())
)

class StoryboardChangeFactory {

  static addSceneToStoryboard(doc, sceneName, relativePath) {
    const mod = CodeMod(doc.code)
    mod.addImport(sceneName, [], relativePath)
    if (mod.getAllMatchingFunctionCalls(
      'SceneManager',
      'registerScene'
    ).length == 0) {
      mod.addFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', value: sceneName}
        ],
        {
          appendToBody: true,
          withComment: {
            value: 'registerScenes',
            leading: true,
          }
        }
      )
      .removeExports()
      .addFunctionCall(
        'SceneManager',
        'registerEntryScene',
        [{
          type: 'Literal',
          value: sceneName,
        }],
        { appendToBody: true, }
      )
      .addExport(true, {
        type: 'CallExpression',
        expression: [
          'SceneManager',
          'getEntryScene',
          []
        ]
      })
    } else {
      mod.addFunctionCall(
          'SceneManager',
          'registerScene',
          [
            {type: 'Literal', value: sceneName},
            {type: 'Identifier', value: sceneName}
          ],
          {
            afterCommentMatching: 'registerScenes'
          }
        )
    }

    return createChange(doc, mod)
  }

  static removeSceneFromStoryboard(doc, sceneName, relativePath) {
    const mod = CodeMod(doc.code)
    mod.removeImport(relativePath, {
      preserveComments: true,
    })
    const scenesRemaining = mod.getAllMatchingFunctionCalls(
      'SceneManager',
      'registerScene'
    ).length
    //remove comment marker if this is the last comment
    const preserveComments = scenesRemaining > 1
    const removeEntryScene = scenesRemaining == 1

    mod.removeFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', value: sceneName},
        ],
        { preserveComments, }
      )

    if (removeEntryScene) {
      mod.removeFunctionCall(
        'SceneManager',
        'registerEntryScene'
      )
    }

    return createChange(doc, mod)
  }

  static addEntryScene(doc, sceneName) {
    return StoryboardChangeFactory.updateEntryScene(doc, sceneName)
  }

  static removeEntryScene(doc, sceneName, projectName) {
    const mod = CodeMod(doc.code).removeExports()
    return createChange(doc, mod)
  }

  static updateEntryScene(doc, sceneName) {
    const mod = CodeMod(doc.code)
      .removeExports()
      .removeFunctionCall(
        'SceneManager',
        'registerEntryScene'
      )
      .addFunctionCall(
        'SceneManager',
        'registerEntryScene',
        [{
          type: 'Literal',
          value: sceneName,
        }],
        { appendToBody: true, }
      )
      .addExport(true, {
        type: 'CallExpression',
        expression: [
          'SceneManager',
          'getEntryScene',
          []
        ]
      })
    return createChange(doc, mod)
  }
}

export default StoryboardChangeFactory
