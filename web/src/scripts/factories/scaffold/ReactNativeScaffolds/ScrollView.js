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

const ScrollView = {
  name: 'ScrollView',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'ScrollView',
      'View',
      'Text',
    ]
  },
  props: [],
  template: (() => {
    let template='//ScrollView should be wrapped in a view with flex:1\n'
    template+='//this is because ScrollView requires a bounded height to work\n'
    template+='<View style={{flex:1}}>\n'
    template+='  <ScrollView \n'
    template+='    onScroll={() => { console.log(\'onScroll!\') }}\n'
    template+='    //insert a RefreshControl component here to add pull to refresh, otherwise delete the prop\n'
    template+='    refreshControl={null}\n'
    template+='    //if switching to horizontal mode, the two props below should change the word Vertical to Horizontal\n'
    template+='    showVerticalScrollIndicator={false}\n'
    template+='    alwaysBounceVertical={true}\n'
    template+='    horizontal={false}\n'
    template+='    style={{\n'
    template+='      backgroundColor: \'#6A85B1\',\n'
    template+='      height: 300,\n'
    template+='    }}\n'
    template+='    contentOffset={{x: 0, y: 0}}\n'
    template+='    paginEnabled={false} >\n'
    template+='      {\n'
    template+='      //ScrollView\'s children should be an array of rows\n'
    template+='      [\n'
    template+='        (<View key={0} style={{flex: 1, alignItems: \'center\', margin: 10,}}>\n'
    template+='          <Text>Hello</Text>\n'
    template+='        </View>),\n'
    template+='        (<View key={1} style={{flex: 1, alignItems: \'center\', margin: 10,}}>\n'
    template+='          <Text>World</Text>\n'
    template+='        </View>),\n'
    template+='      ]}\n'
    template+='    </ScrollView>\n'
    template+='</View>'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { ScrollView, View, Text, } from \'react-native\'',
  ],
}

export default ScrollView
