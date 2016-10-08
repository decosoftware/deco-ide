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

import * as URIUtils from '../utils/URIUtils'
import * as ElementTreeUtils from '../utils/ElementTreeUtils'
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

export const focusedTabId = createSelector(
  ({ui: {tabs}}) => tabs,
  (tabs) => {
    const {focusedGroupIndex, groups} = _.get(tabs, CONTENT_PANES.CENTER, {})
    return _.get(groups, `${focusedGroupIndex}.focusedTabId`)
  }
)

export const focusedGroupIndex = createSelector(
  ({ui: {tabs}}) => tabs,
  (tabs) => _.get(tabs, `${CONTENT_PANES.CENTER}.focusedGroupIndex`, 0)
)

export const focusedFileId = createSelector(
  focusedTabId,
  (focusedTabId) => focusedTabId && URIUtils.withoutProtocolOrParams(focusedTabId)
)

const emptyArray = []

export const tabIds = createSelector(
  ({ui: {tabs}}) => tabs,
  (tabs) => _.get(tabs, `${CONTENT_PANES.CENTER}.groups.0.tabIds`, emptyArray)
)

export const tabGroups = createSelector(
  ({ui: {tabs}}) => tabs,
  (tabs) => _.get(tabs, `${CONTENT_PANES.CENTER}.groups`, emptyArray)
)

export const filesByTabId = createSelector(
  ({directory}) => directory.filesById,
  tabGroups,
  (filesById, tabGroups) => {
    const tabIds = _.flatten(tabGroups.map(group => group.tabIds))

    return tabIds.reduce((acc, tabId) => {
      const fileId = URIUtils.withoutProtocolOrParams(tabId)
      acc[tabId] = filesById[fileId]
      return acc
    }, {})
  }
)

export const selectedElement = createSelector(
  focusedFileId,
  ({elementTree}) => elementTree,
  (focusedFileId, elementTree) => {
    const tree = elementTree.elementTreeForFile[focusedFileId]
    const elementPath = elementTree.selectedElementPathForFile[focusedFileId]

    if (tree && elementPath) {
      return ElementTreeUtils.getElementByPath(tree, elementPath)
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

    return componentsByTagName[element.name]
  }
)

export const publishingFeature = createSelector(
  ({preferences}) => preferences,
  (preferences) => preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE]
)

export const componentList = createSelector(
  publishingFeature,
  ({components}) => components.list,
  ({modules}) => modules.modules,
  (publishingFeature, components, modules) => publishingFeature ? components : modules
)

export const currentDoc = createSelector(
  ({editor: {docCache}}) => docCache,
  focusedFileId,
  (docCache, focusedFileId) => focusedFileId ? docCache[focusedFileId] : null
)

export const tabContainerId = createSelector(
  () => CONTENT_PANES.CENTER
)

// Takes props
export const docByFileId = createSelector(
  ({editor: {docCache}}) => docCache,
  (state, props) => props.fileId,
  (docCache, fileId) => docCache[fileId]
)

// Takes props
export const componentById = createSelector(
  componentList,
  (state, props) => props.id,
  (componentList, id) => componentList.find(c => c.id === id)
)
