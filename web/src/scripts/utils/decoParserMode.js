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

var CodeMirror = require('codemirror')

CodeMirror.defineMode("deco", function(config) {
  var jsxMode = CodeMirror.getMode(config, "jsx")

  function token(stream, state) {
    return jsxMode.token(stream, state)
  }

  return {
    startState: jsxMode.startState,
    copyState: jsxMode.copyState,
    token: token,
    indent: jsxMode.indent,
    innerMode: jsxMode.innerMode,
  }
}, "jsx")

CodeMirror.defineMIME("text/deco", "deco")
