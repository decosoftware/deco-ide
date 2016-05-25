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

const Image = {
  name: 'Image',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'Image',
    ]
  },
  props: [],
  template: (() => {
    let template = '<Image \n'
    template+='  style={{\n'
    template+='  \twidth: 100,\n'
    template+='  \theight: 100,\n'
    template+='  }}\n'
    template+='  resizeMode={\'contain\'}\n'
    template+='  source={{uri:\'https://unsplash.it/100/100/?random\'}} />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { Image } from \'react-native\'',
  ],
}

export default Image
