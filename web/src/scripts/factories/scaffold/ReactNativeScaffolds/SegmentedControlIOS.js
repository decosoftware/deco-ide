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

const SegmentedControlIOS = {
  name: 'SegmentedControlIOS',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'SegmentedControlIOS',
    ]
  },
  props: [],
  template: (() => {
    let template = '<SegmentedControlIOS \n'
    template+='  values={[\'Hello\',\'World\']}\n'
    template+='  selectedIndex={ this.state ? this.state.sIdx ? this.state.sIdx : 0 : 0 }\n'
    template+='  onChange={(event) => this.setState({ sIdx: event.nativeEvent.selectedSegmentIndex }) }\n'
    template+='  onValueChange={(value) => {} } />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { SegmentedControlIOS } from \'react-native\'',
  ],
}

export default SegmentedControlIOS
