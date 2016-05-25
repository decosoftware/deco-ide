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

const RefreshControl = {
  name: 'RefreshControl',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'RefreshControl',
    ]
  },
  props: [],
  template: (() => {
    let template = '//RefreshControl is meant to be used with ScrollView\n'
    template+='<RefreshControl \n'
    template+='  onRefresh={() => {\n'
    template+='    //timeout is for example purposes, it is not safe to use in practice\n'
    template+='    this.setState({ refreshing: true })\n'
    template+='    setTimeout(() => { this.setState({ refreshing: false }) }, 1000)\n'
    template+='  }}\n'
    template+='  refreshing={this.state ? this.state.refreshing ? this.state.refreshing : false : false }\n'
    template+='  tintColor={\'red\'}\n'
    template+='  title={\'Loading...\'}\n'
    template+='  colors={[\'#ff0000\', \'#00ff00\', \'#0000ff\']}\n'
    template+='  progressBackgroundColor=\'#ffff00\' />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { RefreshControl } from \'react-native\'',
  ],
}

export default RefreshControl
