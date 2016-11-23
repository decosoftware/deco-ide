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
const remote = Electron.remote
const { dialog } = remote

import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import StringInput from '../input/StringInput'
import Button from '../buttons/Button'

const stylesCreator = ({fonts}) => ({
  container : {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    height: 30,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyStringInput extends Component {

  static defaultProps = {
    title: '',
    value: '',
    button: 'Browse...',
    onFocus: () => {},
    onBlur: () => {},
  }

  state = {focused: false}

  onFocus = () => {
    const {onFocus} = this.props
    const {focused} = this.state

    if (focused) return

    this.setState({focused: true})
    onFocus()
  }

  onBlur = () => {
    const {onBlur} = this.props
    const {focused} = this.state

    if (!focused) return

    this.setState({focused: false})
    onBlur()
  }

  onSelectFile = () => {
    const {onChange} = this.props

    const result = dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: 'Select Project Location',
      properties: ['openDirectory', 'createDirectory']
    })

    if (result) {
      onChange(result[0])
    }
  }

  render() {
    const {styles, title, value, button, onChange, actions, dividerType, disabled, autoFocus} = this.props
    const {focused} = this.state

    return (
      <PropertyField
        title={title}
        actions={actions}
        dividerType={dividerType}
        active={focused}
      >
        <div style={styles.container}>
          <div style={styles.row}>
            <StringInput
              value={value}
              width={'100%'}
              onChange={onChange}
              disabled={disabled}
              autoFocus={autoFocus}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            />
          </div>
          <Button onClick={this.onSelectFile}>
            {button}
          </Button>
        </div>
      </PropertyField>
    )
  }
}
