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

const Modal = {
  name: 'Modal',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'Modal',
      'View',
      'Text',
    ]
  },
  props: [],
  template: (() => {
    let template = '<View> \n'
    template+=' <Modal \n'
    template+='   animated={true}\n'
    template+='   transparent={false}\n'
    template+='   visible={this.state ? this.state.modalVisible ? this.state.modalVisible : true : true }>\n'
    template+='   <View style={{flex: 1, backgroundColor: \'#f5fcff\', alignItems: \'center\', justifyContent: \'center\', padding: 20 }}>\n'
    template+='     <Text>Hello Modal</Text>\n'
    template+='   </View>\n'
    template+=' </Modal>\n'
    template+='</View>'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { Modal, View, Text, } from \'react-native\'',
  ],
}

export default Modal
