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

const TextInput = {
  name: 'TextInput',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'TextInput',
    ]
  },
  props: [],
  template: (() => {
    let template = '<TextInput \n'
    template+='  style={{\n'
    template+='    height: 40,\n'
    template+='    width: 100,\n'
    template+='    borderColor: \'gray\',\n'
    template+='    borderWidth: 1,\n'
    template+='    padding: 10,\n'
    template+='    margin: 10,\n'
    template+='    }}\n'
    template+='  onChangeText={(text) => this.setState({text})}\n'
    template+='  placeholder={\'Type here ... \'}\n'
    template+='  value={this.state ? this.state.text ? this.state.text : \'\' : \'\' } />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { TextInput } from \'react-native\'',
  ],
}

export default TextInput
