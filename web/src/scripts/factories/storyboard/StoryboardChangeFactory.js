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
      .addImport(sceneName, [], relativePath)
      .addFunctionCall(
          'SceneManager',
          'registerScene',
          [
            {type: 'Literal', value: sceneName},
            {type: 'Identifier', value: sceneName}
          ]
        )

    return createChange(doc, mod)
  }

  static removeSceneFromStoryboard(doc, sceneName, relativePath) {
    const mod = CodeMod(doc.code)
      .removeImport(relativePath)
      .removeFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', value: sceneName},
        ]
      )

    return createChange(doc, mod)
  }

  static addEntryScene(doc, sceneName) {
    const mod = CodeMod(doc.code).addFunctionCall(
      'SceneManager',
      'registerEntryScene',
      [
        {type: 'Literal', value: sceneName},
      ]
    )
    return createChange(doc, mod)
  }

  static removeEntryScene(doc, sceneName, projectName) {
    const mod = CodeMod(doc.code).removeFunctionCall(
      'SceneManager',
      'registerEntryScene'
    )
    return createChange(doc, mod)
  }

  static updateEntryScene(doc, sceneName) {
    const mod = CodeMod(doc.code).updateFunctionCall(
      'SceneManager',
      'registerEntryScene',
      [
        {type: 'Literal', value: sceneName},
      ]
    )
    return createChange(doc, mod)
  }
}

export default StoryboardChangeFactory
