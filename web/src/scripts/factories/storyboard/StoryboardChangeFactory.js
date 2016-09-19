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
import CodeMod from '../utils/codemod'

const createChange = (doc, mod) => (
  DecoChangeFactory.createChangeToReplaceAllText(doc, mod.code)
)

class StoryboardChangeFactory {

  static addSceneToStoryboard(doc, sceneName, relativePath) {
    const mod = new CodeMod(doc.code).transform
      .addImport(sceneName, [], relativePath)
      .addFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', name: sceneName},
        ]
      )
    return createChange(doc, mod)
  }

  static removeSceneFromStoryboard(doc, sceneName, relativePath) {
    const mod = new CodeMod(doc.code).transform
      .removeImport(sceneName, [], relativePath)
      .removeFunctionCall(
        'SceneManager',
        'registerScene',
        [
          {type: 'Literal', value: sceneName},
          {type: 'Identifier', name: sceneName},
        ]
      )
    return createChange(doc, mod)
  }

  static addEntryScene(doc, sceneName, projectName) {
    const mod = new CodeMod(doc.code).transform.addFunctionCall(
      'SceneManager',
      'registerEntrySceneForProject',
      [
        {type: 'Literal', value: projectName},
        {type: 'Literal', value: sceneName},
      ]
    )
    return createChange(doc, mod)
  }

  static removeEntryScene(doc, sceneName, projectName) {
    const mod = new CodeMod(doc.code).transform.removeFunctionCall(
      'SceneManager',
      'registerEntrySceneForProject'
    )
    return createChange(doc, mod)
  }

  static updateEntryScene(doc, sceneName, projectName) {
    const mod = new CodeMod(doc.code).transform.updateFunctionCall(
      'SceneManager',
      'registerEntrySceneForProject',
      [
        {type: 'Literal', value: projectName},
        {type: 'Literal', value: sceneName},
      ]
    )
    return createChange(doc, mod)
  }
}

export default StoryboardChangeFactory
