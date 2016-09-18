import { createSelector } from 'reselect'

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
