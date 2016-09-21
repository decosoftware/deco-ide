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

import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'
import update from 'react-addons-update'

import PropertySelectInput from './PropertySelectInput'
import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import Property from './Property'
import ValueInput from '../input/ValueInput'
import StringInput from '../input/StringInput'
import PropertyListInput from './PropertyListInput'
import DropdownMenuButton from '../buttons/DropdownMenuButton'
import { OPTIONS } from '../../constants/PrimitiveTypes'

const stylesCreator = ({colors, fonts}) => ({
  row: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  actions: {
    flex: 0,
    flexDirection: 'row',
    display: 'flex',
  },
  actionText: {
    ...fonts.regular,
  },
  actionSpacer: {
    marginRight: 15,
  },
  dropdownMenu: {
    padding: 0,
  },
  dropdownMenuInner: {
    width: 180,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 15,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyComponentPropsInput extends Component {

  static defaultProps = {
    title: '',
    value: [],
    template: (props) => ({
      name: 'hello',
      type: 'string',
      editWith: 'inputField',
      value: 'world',
    })
  }

  renderSettingsDropdown = (prop, actions) => {
    const {styles} = this.props
    const {type} = prop

    return (
      <div style={styles.dropdownMenuInner}>
        <PropertySelectInput
          title={'Type'}
          value={type}
          onChange={actions.changeKey.bind(this, 'type')}
          options={OPTIONS}
          showValueAsOption={false}
          dividerType={'vibrant'}
        />
      </div>
    )
  }

  renderActions(prop, actions) {
    const {styles} = this.props

    return (
      <div style={styles.actions}>
        <DropdownMenuButton
          renderContent={this.renderSettingsDropdown.bind(this, prop, actions)}
          captureBackground={true}
          menuStyle={styles.dropdownMenu}
          hideOnClick={false}
        >
          <div
            style={styles.actionText}
          >
            Settings
          </div>
        </DropdownMenuButton>
        <div style={styles.actionSpacer} />
        <div
          style={styles.actionText}
          onClick={actions.remove}
        >
          Remove
        </div>
      </div>
    )
  }

  renderRow = (prop, actions) => {
    const {styles} = this.props
    const {name, value, type, editWith} = prop

    return (
      <div style={styles.row}>
        <StringInput
          value={name}
          onChange={actions.changeKey.bind(this, 'name')}
        />
        <ValueInput
          // Pass through extras like dropdownOptions
          {...prop}
          value={value}
          type={type}
          editWith={editWith}
          onChange={actions.changeKey.bind(this, 'value')}
        />
        {this.renderActions(prop, actions)}
      </div>
    )
  }

  render() {
    const {title, value, template, renderRow, onChange} = this.props

    return (
      <PropertyListInput
        title={title}
        value={value}
        template={template}
        renderRow={this.renderRow}
        onChange={onChange}
      />
    )
  }
}
