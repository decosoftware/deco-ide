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

const Enum = function(names = [], offset = 0, geometric = 0) {
  if (typeof names === 'string') {
    names = Array.prototype.slice.call(arguments)
    offset = 0
    geometric = 0
  }
  let e = {}
  names.forEach((name, i) => {
    let j = i
    j = ! offset ? j : j + offset
    j = ! geometric ? j : Math.pow(geometric, j)
    e[e[name] = j] = name
  })
  return e
}

export default Enum
