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

/* global CodeMirror */
/* global define */

/**
 The MIT License (MIT)

 Copyright (c) 2015-2016 coderaiser

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// Adapted from https://github.com/coderaiser/cm-show-invisibles (MIT)
(function(mod) {
    mod(require('codemirror'))
})(function(CodeMirror) {
    'use strict';

    CodeMirror.defineOption('showInvisibles', false, function(cm, val, prev) {
        var Count   = 0,
            Maximum = cm.getOption('maxInvisibles') || 16;

        if (prev === CodeMirror.Init)
            prev = false;

        if (prev && !val) {
            cm.removeOverlay('invisibles');
            rm();
        } else if (!prev && val) {
            add(Maximum);

            cm.addOverlay({
                name: 'invisibles',
                token:  function nextToken(stream) {
                    var ret,
                        spaces  = 0,
                        peek    = stream.peek() === ' ';

                    if (peek) {
                        while (peek && spaces < Maximum) {
                            ++spaces;

                            stream.next();
                            peek = stream.peek() === ' ';
                        }

                        ret = 'whitespace whitespace-' + spaces;

                        /*
                         * styles should be different
                         * could not be two same styles
                         * beside because of this check in runmode
                         * function in `codemirror.js`:
                         *
                         * 6624: if (!flattenSpans || curStyle != style) {}
                         */
                        if (spaces === Maximum)
                            ret += ' whitespace-rand-' + Count++;

                    } else {
                        while (!stream.eol() && !peek) {
                            stream.next();

                            peek = stream.peek() === ' ';
                        }

                        ret = 'cm-eol';
                    }

                    return ret;
                }
            });
        }
    });

    function add(max) {
        var i, rule,
            classBase   = '.CodeMirror .cm-whitespace-',
            spaceChars  = '',
            rules       = '',
            spaceChar   = '·',
            style       = document.createElement('style');

        style.setAttribute('data-name', 'js-show-invisibles');

        for (i = 1; i <= max; ++i) {
            spaceChars += spaceChar;

            rule    = classBase + i + ':not(.editor-lv)' + '::before { content: "' + spaceChars + '";}\n';
            rules   += rule;
        }

        style.textContent = getStyle() + '\n' + getEOL() + '\n' + rules;

        document.head.appendChild(style);
    }

    function rm() {
        var styles = document.querySelectorAll('[data-name="js-show-invisibles"]');
        Array.prototype.forEach.call(styles, function(style) {
            document.head.removeChild(style);
        });
    }

    function getStyle() {
        var style = [
            '.cm-whitespace:not(.editor-lv)::before {',
                'position: absolute;',
                'pointer-events: none;',
                'color: rgba(255,255,255,0.15);',
            '}'
        ].join('');

        return style;
    }

    function getEOL() {
         var style = [
            '.CodeMirror-code > div > pre > span::after {',
                'pointer-events: none;',
                'color: rgba(255,255,255,0.15);',
                'content: "¬"',
            '}',

        ].join('');

        return style;
    }
});
