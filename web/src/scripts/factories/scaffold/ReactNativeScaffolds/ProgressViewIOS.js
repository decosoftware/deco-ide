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

const ProgressViewIOS = {
  name: 'ProgressViewIOS',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'ProgressViewIOS',
    ]
  },
  props: [ {
    name: 'style',
    defaultValue: {
      color: 'black',
      fontWeight: 'normal',
      fontFamily: 'Helvetica, sans-serif',
      fontSize: 16,
      textAlign: 'center',
    },
    type: 'object',
  }, ],
  template: (() => {
    let template = '<ProgressViewIOS \n'
    template+='  style={{\n'
    template+='    marginTop: 20,\n'
    template+='    width: 100,\n'
    template+='  }}\n'
    template+='  progress={Math.random()}\n'
    template+='  progressTintColor={\'purple\'} />'

    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { ProgressViewIOS } from \'react-native\'',
  ],
}

export default ProgressViewIOS
