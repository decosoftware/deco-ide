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

import { EventEmitter, } from 'events'

class Display extends EventEmitter {
  constructor() {
    super()

    this.isRetina = window.devicePixelRatio >= 2
    this.scale = this.isRetina ? 2 : 1

    this._listenToDisplayChange()
  }

  _listenToDisplayChange() {

    // http://stackoverflow.com/questions/28905420/window-devicepixelratio-change-listener
    window.matchMedia('screen and (min-resolution: 2dppx)').addListener((e) => {
      if (e.matches) {
        this.isRetina = true
        this.scale = 2
      } else {
        this.isRetina = false
        this.scale = 1
      }

      this.emit('scale', this.scale)
    })
  }
}

export default new Display()
