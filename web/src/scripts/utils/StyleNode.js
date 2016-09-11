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

export default class {
  constructor() {
    this.styleNode = null
    this.text = ''
  }

  attach() {
    if (this.styleNode) return

    this.styleNode = document.createElement('style')

    if (this.text) {
      this.styleNode.textContent = this.text
    }

    document.head.appendChild(this.styleNode)
  }

  detach() {
    if (!this.styleNode) return

    document.head.removeChild(this.styleNode)
    this.styleNode = null
  }

  setText(text) {
    this.text = text

    if (this.styleNode) {
      this.styleNode.textContent = text
    }
  }
}
