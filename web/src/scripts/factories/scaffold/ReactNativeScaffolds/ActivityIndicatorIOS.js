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

const ActivityIndicatorIOS = {
  name: 'ActivityIndicatorIOS',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'ActivityIndicatorIOS',
    ]
  },
  props: [],
  template: (() => {
    let template = '<ActivityIndicatorIOS \n'
    template+='  style={{\n'
    template+='  \talignItems: \'center\',\n'
    template+='  \tjustifyContent: \'center\',\n'
    template+='  }}\n'
    template+='  animating={true}\n'
    template+='  size={\'small\'}\n'
    template+='  color={\'black\'} />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { ActivityIndicatorIOS } from \'react-native\'',
  ],
}

export default ActivityIndicatorIOS
