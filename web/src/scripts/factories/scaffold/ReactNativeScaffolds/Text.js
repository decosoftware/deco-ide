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

const Text = {
  name: 'Text',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'Text',
    ]
  },
  props: [ {
    name: 'style',
    defaultValue: {
      color: 'black',
      fontWeight: 'normal',
      fontFamily: 'helvetica',
      fontSize: 16,
      textAlign: 'center',
    },
    type: 'object',
  }, ],
  template: (() => {
    let template = '<Text \n'
    template+='  style={{\n'
    template+='  \tcolor: \'black\',\n'
    template+='  \tfontWeight: \'normal\',\n'
    template+='  \tfontFamily: \'helvetica\',\n'
    template+='  \tfontSize: 16,\n'
    template+='  \ttextAlign: \'center\',\n'
    template+='  }}>\n'
    template+='  Text\n'
    template+='</Text>'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { Text } from \'react-native\'',
  ],
}

export default Text
