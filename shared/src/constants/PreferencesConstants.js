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

export const ROOT_KEY = 'PREFERENCES'

export const CATEGORIES = _.mapKeys([
  'GENERAL',
  'SAVING',
  'EDITOR',
])

export const PREFERENCES = {
  [CATEGORIES.GENERAL]: _.mapKeys([
    'ANDROID_HOME',
    'GENYMOTION_APP',
    'USE_GENYMOTION',
  ]),
  [CATEGORIES.SAVING]: _.mapKeys([
    'AUTOSAVE',
    'PROPERTY_CHANGE',
    'TEXT_EDIT',
    'DEBOUNCE',
  ]),
  [CATEGORIES.EDITOR]: _.mapKeys([
    'VIM_MODE',
    'SHOW_INVISIBLES',
    'SHOW_INDENT_GUIDES',
    'HIGHLIGHT_ACTIVE_LINE',
    'NPM_REGISTRY',
  ]),
}

export const METADATA = {
  [CATEGORIES.GENERAL]: {
    [PREFERENCES[CATEGORIES.GENERAL].ANDROID_HOME]: {
      defaultValue: '',
    },
    [PREFERENCES[CATEGORIES.GENERAL].GENYMOTION_APP]: {
      defaultValue: '',
    },
    [PREFERENCES[CATEGORIES.GENERAL].USE_GENYMOTION]: {
      defaultValue: false,
    },
  },
  [CATEGORIES.SAVING]: {
    [PREFERENCES[CATEGORIES.SAVING].AUTOSAVE]: {
      defaultValue: true,
    },
    [PREFERENCES[CATEGORIES.SAVING].PROPERTY_CHANGE]: {
      defaultValue: true,
    },
    [PREFERENCES[CATEGORIES.SAVING].TEXT_EDIT]: {
      defaultValue: true,
    },
    [PREFERENCES[CATEGORIES.SAVING].DEBOUNCE]: {
      defaultValue: 1500,
    },
  },
  [CATEGORIES.EDITOR]: {
    [PREFERENCES[CATEGORIES.EDITOR].VIM_MODE]: {
      defaultValue: false,
    },
    [PREFERENCES[CATEGORIES.EDITOR].SHOW_INVISIBLES]: {
      defaultValue: false,
    },
    [PREFERENCES[CATEGORIES.EDITOR].HIGHLIGHT_ACTIVE_LINE]: {
      defaultValue: true,
    },
    [PREFERENCES[CATEGORIES.EDITOR].SHOW_INDENT_GUIDES]: {
      defaultValue: false,
    },
    [PREFERENCES[CATEGORIES.EDITOR].NPM_REGISTRY]: {
      defaultValue: 'https://registry.npmjs.org',
    },
  }
}
