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

import _ from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'

const menuStyle = {
  position: 'absolute',
  paddingTop: 5,
  paddingBottom: 5,
  background: 'rgb(252,251,252)',
  borderRadius: '3px',
  boxShadow: '0 2px 8px 1px rgba(0,0,0,0.3)',
  border: '1px solid rgba(0,0,0,0.2)',
  width: 232,
}

const INPUT_WIDTH = 130

export default class extends Component {

  static defaultProps = {
    requestClose: () => {},
  }

  constructor(props) {
    super()

    const {name} = props

    this.state = {
      inProgress: null,
    }
  }

  componentDidMount() {
    const nameElement = ReactDOM.findDOMNode(this.refs.nameInput)

    if (nameElement) {
      nameElement.focus()
      nameElement.setSelectionRange(0, nameElement.value.length)
    }
  }

  render() {
    const {name, onChange, requestClose, withConfirmation} = this.props
    const {inProgress} = this.state

    return (
      <div style={menuStyle}>
        <FormRow
          label={withConfirmation && inProgress !== null ? '↵ to confirm' : 'Name'}
          inputWidth={INPUT_WIDTH}
        >
          {withConfirmation ? (
            <StringInput
              ref={'nameInput'}
              value={inProgress || name || ''}
              onChange={(value) => this.setState({inProgress: value})}
              onSubmit={(value) => {
                this.setState({inProgress: null})
                onChange(value)
                requestClose()
              }}
            />
          ) : (
            <StringInput
              ref={'nameInput'}
              value={name}
              onChange={onChange}
              onSubmit={requestClose}
            />
          )}
        </FormRow>
      </div>
    )
  }
}
