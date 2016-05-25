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


// TODO consolidate with router
export const getRootPath = (state) => {
  const match = state.routing.location.pathname.match(/\/workspace\/(.*)?/)
  if (match && match[1]) {
    const hexString = new Buffer(match[1], 'hex')
    const path = hexString.toString('utf8')
    return path
  }
  return null
}