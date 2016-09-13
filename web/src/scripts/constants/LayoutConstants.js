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

export const LAYOUT_KEY = 'LAYOUT'

export const LAYOUT_FIELDS = {
  RIGHT_SIDEBAR_CONTENT: 'rightSidebarContent',
  LEFT_SIDEBAR_VISIBLE: 'leftSidebarVisible',
  CONSOLE_VISIBLE: 'consoleVisible',
  WINDOW_BOUNDS: 'windowBounds',
  SIMULATOR_MENU_PLATFORM: 'simulatorMenuPlatform',
}

export const RIGHT_SIDEBAR_CONTENT = _.mapKeys([
  'NONE',
  'PROPERTIES',
  'PUBLISHING',
])

export const CONTENT_PANES = _.mapKeys([
  'CENTER',
])
