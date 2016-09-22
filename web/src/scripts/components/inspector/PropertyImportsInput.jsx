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

import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import Property from './Property'
import ValueInput from '../input/ValueInput'
import StringInput from '../input/StringInput'
import PropertyListInput from './PropertyListInput'
import PropertyRemoveButton from './PropertyRemoveButton'

const stylesCreator = ({colors, fonts}) => ({
  content: {
    flexDirection: 'column',
    display: 'flex',
  },
  row: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    height: 30,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyComponentPropsInput extends Component {

  static defaultProps = {
    title: '',
    value: [],
    template: (props) => ({
      name: 'react-native',
      members: [
        {
          name: 'default',
          alias: 'ReactNative',
        }
      ],
    }),
    memberTemplate: (props) => ({
      name: 'Component',
    }),
  }

  renderMember = (member, actions, i) => {
    const {styles} = this.props
    const {name, alias} = member

    return (
      <div style={styles.row}>
        <StringInput
          value={name}
          placeholder={'Name'}
          onChange={actions.changeKey.bind(this, 'name')}
        />
        <StringInput
          value={alias}
          placeholder={'Alias'}
          onChange={actions.changeKey.bind(this, 'alias')}
        />
        <PropertyRemoveButton
          onClick={actions.remove}
        />
      </div>
    )
  }

  renderRow = (dependency, actions) => {
    const {styles, memberTemplate} = this.props
    const {name, alias, members} = dependency

    return (
      <div style={styles.content}>
        <div style={styles.row}>
          <StringInput
            value={name}
            placeholder={'Name'}
            onChange={actions.changeKey.bind(this, 'name')}
          />
          <PropertyRemoveButton
            onClick={actions.remove}
          />
        </div>
        <PropertyListInput
          title={null}
          buttonText={'Add Member Import'}
          dividerType={'none'}
          value={members}
          renderRow={this.renderMember}
          onChange={actions.changeKey.bind(this, 'members')}
          template={memberTemplate}
        />
      </div>
    )
  }

  render() {
    const {title, value, template, renderRow, onChange} = this.props

    return (
      <PropertyListInput
        title={title}
        buttonText={'Add Import'}
        value={value}
        template={template}
        renderRow={this.renderRow}
        onChange={onChange}
      />
    )
  }
}
