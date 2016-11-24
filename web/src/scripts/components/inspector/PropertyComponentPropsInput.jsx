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
import PropertyRemoveButton from './PropertyRemoveButton'
import PropertySettingsButton from './PropertySettingsButton'
import PropertySettingsDropdown from './PropertySettingsDropdown'
import * as Parser from '../../utils/Parser'
import PrimitiveTypes, { OPTIONS } from '../../constants/PrimitiveTypes'

const stylesCreator = ({colors, fonts}) => ({
  row: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    height: 30,
  },
  column: {
    flexDirection: 'column',
    display: 'flex',
  },
  actions: {
    flex: 0,
    flexDirection: 'row',
    display: 'flex',
  },
  actionSpacer: {
    marginRight: 10,
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
    buttonText: 'Add Prop',
    value: [],
    template: (props) => ({
      name: 'hello',
      type: 'string',
      editWith: 'inputField',
      value: 'world',
    })
  }

  changePropType = (prop, actions, newType) => {
    const {type: oldType, value} = prop

    actions.change(update(prop, {
      $merge: {
        type: newType,
        value: Parser.castType(value, oldType, newType),
      },
    }))
  }

  renderSettingsDropdown = (prop, actions) => {
    const {styles} = this.props

    return (
      <PropertySettingsDropdown
        prop={prop}
        onChange={actions.change}
        onChangeKey={actions.changeKey}
      />
    )
  }

  renderActions(prop, actions) {
    const {styles} = this.props
    const {type, value} = prop
    const isObject = type === PrimitiveTypes.OBJECT

    return (
      <div style={styles.actions}>
        <DropdownMenuButton
          renderContent={this.renderSettingsDropdown.bind(this, prop, actions)}
          captureBackground={true}
          menuStyle={styles.dropdownMenu}
          hideOnClick={false}
        >
          <PropertySettingsButton />
        </DropdownMenuButton>
        <div style={styles.actionSpacer} />
        <PropertyRemoveButton
          onClick={actions.remove}
        />
      </div>
    )
  }

  renderRow = (prop, actions) => {
    const {styles} = this.props
    const {name, value, type, editWith} = prop

    if (type === PrimitiveTypes.OBJECT) {
      return (
        <div style={styles.column}>
          <div style={styles.row}>
            <StringInput
              value={name}
              placeholder={'Name'}
              onChange={actions.changeKey.bind(this, 'name')}
            />
            {this.renderActions(prop, actions)}
          </div>
          <PropertyComponentPropsInput
            title={null}
            buttonText={'Add Key / Value'}
            renderActions={null}
            value={value}
            onChange={actions.changeKey.bind(this, 'value')}
          />
        </div>
      )
    }

    return (
      <div style={styles.row}>
        <StringInput
          value={name}
          placeholder={'Name'}
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
    const {title, buttonText, renderActions, value, template, onChange} = this.props

    return (
      <PropertyListInput
        title={title}
        buttonText={buttonText}
        renderActions={renderActions}
        value={value}
        template={template}
        renderRow={this.renderRow}
        onChange={onChange}
      />
    )
  }
}
