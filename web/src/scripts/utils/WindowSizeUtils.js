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

import { LAYOUT_FIELDS, LAYOUT_KEY } from '../constants/LayoutConstants'
import LocalStorage from '../persistence/LocalStorage'

export const getCurrentWindowBounds = () => ({
  x: window.screenX,
  y: window.screenY,
  width: window.innerWidth,
  height: window.innerHeight,
})

export const getSavedWindowBounds = () => {

  // Retrieve stored window bounds
  const data = LocalStorage.loadObject(LAYOUT_KEY)
  const saved = data[LAYOUT_FIELDS.WINDOW_BOUNDS]

  // Always set (x, y) to (0, 0) for now
  // TODO: Handle window move event, store (x, y) to LocalStorage
  const windowBounds = {x: 0, y: 0}

  // If window bounds exist, restore them
  if (saved) {
    const {width, height} = saved

    // Don't make the window larger than the screen
    windowBounds.width = Math.min(width, window.screen.availWidth)
    windowBounds.height = Math.min(height, window.screen.availHeight)

  // Else, set to default bounds
  } else {
    windowBounds.width = window.screen.availWidth * 3 / 4
    windowBounds.height = window.screen.availHeight
  }

  return windowBounds
}
