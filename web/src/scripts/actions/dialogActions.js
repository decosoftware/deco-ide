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

import React from 'react'
import { pushModal } from '../actions/uiActions'
import {
  importModule,
  fetchTemplateText
} from '../api/ModuleClient'
import {
  insertTemplate
} from '../actions/editorActions'
import NamingBanner from '../components/modal/NamingBanner'
import { getRootPath } from '../utils/PathUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'

export const openInstallModuleDialog = () => (dispatch, getState) => {
  const dialog = (
    <NamingBanner
      bannerText={'Install module'}
      onTextDone={(name) => {
        const state = getState()
        const registry = state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY]
        importModule(name, 'latest', getRootPath(state), registry)
      }} />
  )
  dispatch(pushModal(dialog, true))
}

export const openImportTemplateDialog = () => (dispatch, getState) => {
  const dialog = (
    <NamingBanner
      bannerText={'Import template'}
      onTextDone={(url) => {
        dispatch(fetchTemplateText(url)).then((text) => {
          const {openDocId, docCache} = getState().editor

          if (docCache && docCache[openDocId]) {
            dispatch(insertTemplate(docCache[openDocId], text))
          }
        })
      }} />
  )
  dispatch(pushModal(dialog, true))
}
