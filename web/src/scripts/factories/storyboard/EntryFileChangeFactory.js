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

class EntryFileChangeFactory {
  static updateEntryRequire(doc, relativePath) {
    const { code } = doc
    const mod = new CodeMod(code).transform.updateImportSourceForRequire(
      'entry', relativePath
    )
    const updatedCode = mod.transform.toSource()
    return DecoChangeFactory.createChangeToReplaceAllText(doc, updatedCode)
  }
}

export default EntryFileChangeFactory
