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

const MapView = {
  name: 'MapView',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'MapView',
    ]
  },
  props: [ {
    name: 'onRegionChange',
    defaultValue: '() => {}',
    type: 'string',
  }, {
    name: 'onRegionChangeComplete',
    defaultValue: '() => {}',
    type: 'string',
  }, {
    name: 'showUserLocation',
    defaultValue: 'true',
    type: 'string',
  }, {
    name: 'style',
    defaultValue: {
      height: 100,
      width: 100,
    },
    type: 'object',
  }],
  template: (() => {
    let template = '<MapView \n'
    template+='\tonRegionChange={() => {}}\n'
    template+='\tonRegionChangeComplete={() => {}}\n'
    template+='\tshowUserLocation={true}\n'
    template+='\tstyle={{\n'
    template+='\t\theight: 100,\n'
    template+='\t\twidth: 100,\n'
    template+='}}>\n'
    template+='</MapView>'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { MapView } from \'react-native\'',
  ],
}

export default MapView
