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
import { createSelector } from 'reselect'

import { getElementByPath } from '../utils/ElementTreeUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'

export const editorOptions = createSelector(
  (state) => state.preferences,
  (preferences) => ({
    theme: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.THEME],
    fontSize: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.FONT_SIZE],
    keyMap: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.VIM_MODE] ? 'vim' : 'sublime',
    showInvisibles: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INVISIBLES],
    styleActiveLine: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE],
    showIndentGuides: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INDENT_GUIDES],
  })
)

const emptyArray = []

export const filesByTabId = createSelector(
  ({directory}) => directory.filesById,
  ({ui: {tabs}}) => _.get(tabs, `${CONTENT_PANES.CENTER}.tabIds`, emptyArray),
  (filesById, tabIds) => tabIds.reduce((acc, tabId) => {
    acc[tabId] = filesById[tabId]
    return acc
  }, {})
)

export const selectedElement = createSelector(
  ({ui}) => ui,
  ({elementTree}) => elementTree,
  (ui, elementTree) => {
    const filename = _.get(ui, `tabs.${CONTENT_PANES.CENTER}.focusedTabId`)
    const tree = elementTree.elementTreeForFile[filename]
    const elementPath = elementTree.selectedElementPathForFile[filename]

    if (tree && elementPath) {
      return getElementByPath(tree, elementPath)
    } else {
      return null
    }
  }
)

export const selectedComponent = createSelector(
  selectedElement,
  ({components}) => components.list,
  (element, components) => {
    if (!element) return null

    const componentsByTagName = _.keyBy(components, 'tagName')
    const component = componentsByTagName[element.name]

    console.log('component', componentsByTagName, element.name)

    return component
  }
)
