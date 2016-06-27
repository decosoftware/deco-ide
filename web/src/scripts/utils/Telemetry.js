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

class Telemetry {
  constructor() {
    this.ga = window.ga || () => {}
    this.lastFocusTime = Date.now()
  }

  bindAppFocusListener() {
    window.addEventListener('focus', () => {
      this.ga('send', {
        hitType: 'event',
        eventCategory: 'Window',
        eventAction: 'focus',
        sessionControl: (Date.now() - this.lastFocusTime > 30*60*1000) ? 'start' : null,
      })
      this.lastFocusTime = Date.now()
    })

    window.addEventListener('unload', () => {
      this.ga('send', {
        hitType: 'event',
        eventCategory: 'Window',
        eventAction: 'unload',
        sessionControl: 'end',
      })
    })

    window.addEventListener('blur', () => {
      this.lastFocusTime = Date.now()
    })
  }
}

let telemetry = new Telemetry()
export default telemetry
