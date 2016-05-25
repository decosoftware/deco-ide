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

import LocalStorage from './LocalStorage'
import {
  setRightSidebarWidth,
  setLeftSidebarWidth,
  setRightSidebarContent,
  setConsoleVisibility,
  setLeftSidebarVisibility,
  setLeftSidebarBottomSectionHeight,
} from '../actions/uiActions'
import { LAYOUT_KEY, LAYOUT_FIELDS } from '../constants/LayoutConstants'

const ACTION_MAP = {
  [LAYOUT_FIELDS.RIGHT_SIDEBAR_WIDTH]: setRightSidebarWidth,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_WIDTH]: setLeftSidebarWidth,
  [LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT]: setRightSidebarContent,
  [LAYOUT_FIELDS.CONSOLE_VISIBLE]: setConsoleVisibility,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE]: setLeftSidebarVisibility,
  [LAYOUT_FIELDS.LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT]: setLeftSidebarBottomSectionHeight,
}

const layoutActionEmitter = (store) => {

  // Load initial data
  const data = LocalStorage.loadObject(LAYOUT_KEY)

  _.each(ACTION_MAP, (action, field) => {
    if (data[field] != null) {
      store.dispatch(action(data[field]))
    }
  })

}

export default layoutActionEmitter
