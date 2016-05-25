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


// JS Numbers are 64-bit, so 1B should be safe.
// Will break on files with more than 1B lines :)
// http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
const LINE_MULTIPLIER = 1000000000

export default (cmPos) => {
  return cmPos.line * LINE_MULTIPLIER + cmPos.ch
}
