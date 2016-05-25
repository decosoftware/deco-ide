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

const DatePickerIOS = {
  name: 'DatePickerIOS',
  version: '0.0.1',
  packages: {},
  dependencies: {
    'react-native': [
      'DatePickerIOS',
    ]
  },
  props: [],
  template: (() => {
    let template = '<DatePickerIOS \n'
    template+='  date={this.state ? this.state.date || new Date() : new Date()}\n'
    template+='  onDateChange={(newDate) => {\n'
    template+='  \tthis.setState({date: newDate})\n'
    template+='  }}\n'
    template+='  mode={\'datetime\'}\n'
    template+='  timeZoneOffsetInMinutes={(-1) * (new Date()).getTimezoneOffset()} />'
    return template
  })(),
  parentModule: 'react-native',
  require: [
    'import { DatePickerIOS } from \'react-native\'',
  ],
}

export default DatePickerIOS
