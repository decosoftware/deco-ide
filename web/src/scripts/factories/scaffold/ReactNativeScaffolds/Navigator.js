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

const Navigator = {
  name: 'Navigator',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'Navigator',
      'View',
    ]
  },
  props: [],
  template: (() => {
    let template = '<Navigator \n'
    template+='    initialRoute={{index: 0, routeProps: { style: { flex: 1, backgroundColor: \'blue\' } } }}\n'
    template+='    //pass in a component if you want a custom navigation bar, otherwise delete this line\n'
    template+='    navigationBar={(<View/>)}\n'
    template+='    renderScene={(route, navigator) => {\n'
    template+='      //write an array of [require(..), ..] at the top pointing to your navigation components\n'
    template+='      //these components assume props.onForward and\n'
    template+='      //props.onForward can pass in an optional props object\n'
    template+='      //props.onBack to move around the navigator\n'
    template+='      //change the name of the componentArray variable below to that of your array\n'
    template+='      return (\n'
    template+='        React.createElement((typeof componentArray !== \'undefined\') ? componentArray[route.index] : View, Object.assign({\n'
    template+='          onForward: (routeProps) => { navigator.push(Object.assign({index: route.index + 1}, routeProps || {}))},\n'
    template+='          onBack: () => { if (route.index > 0) navigator.pop() }\n'
    template+='        }, route.routeProps))\n'
    template+='      )\n'
    template+='    }} />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { Navigator, View } from \'react-native\'',
  ],
}

export default Navigator
