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

const View = {
  name: 'View',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'View',
    ]
  },
  props: [ {
    name: 'style',
    defaultValue: {
      width: 50,
      height: 50,
      backgroundColor: 'blue',
    },
    type: 'object'
  }, ],
  template: (() => {
    let template = '<View \n'
    template+='  style={{\n'
    template+='  \twidth: 50,\n'
    template+='  \theight: 50,\n'
    template+='  \tbackgroundColor: \'blue\',\n'
    template+='  }}>\n'
    template+='</View>'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { View } from \'react-native\'',
  ],
}

export default View
