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
import * as storyboardMod from '../../utils/storyboard/storyboardMod'
import { getSceneInformationForStoryboardCode } from '../../utils/storyboard/codeUtils'
const createChange = (doc, mod) => (
  DecoChangeFactory.createChangeToReplaceAllText(doc, mod.toSource())
)

class StoryboardChangeFactory {

  static addSceneToStoryboard(doc, sceneName, relativePath) {
    const mod = CodeMod(doc.code)
    storyboardMod.addScene(mod, sceneName, relativePath)
    return createChange(doc, mod)
  }

  static removeSceneFromStoryboard(doc, sceneName, relativePath) {
    const mod = CodeMod(doc.code)
    storyboardMod.removeScene(mod, sceneName, relativePath)
    return createChange(doc, mod)
  }

  static renameSceneInStoryboard(doc, oldSceneName, oldPath, newSceneName, newPath) {
    const mod = CodeMod(doc.code)
    const info = getSceneInformationForStoryboardCode(doc.code)
    storyboardMod.removeScene(mod, oldSceneName, oldPath)
    storyboardMod.addScene(mod, newSceneName, newPath)
    if (info && info.entry && info.entry == oldSceneName) {
      storyboardMod.updateEntryScene(mod, newSceneName)
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
    storyboardMod.updateEntryScene(mod, sceneName)
    return createChange(doc, mod)
  }
}



export default StoryboardChangeFactory
