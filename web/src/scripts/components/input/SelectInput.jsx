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

const EMPTY_VALUE = "__DECO_EMPTY__"

const baseStyle = {
  position: 'relative',
  left: -1,
  fontSize: 12,
}

class SelectInput extends Component {

  constructor(props) {
    super(props)
    this.state = {}

    this._renderOptions = this._renderOptions.bind(this)
    this._buildOptions = this._buildOptions.bind(this)
    this._onInputChange = this._onInputChange.bind(this)
    this._normalizeValue = this._normalizeValue.bind(this)
  }

  /* Event handling */

  _normalizeValue(value) {
    if (value == null) {
      return EMPTY_VALUE
    }
    return value
  }

  _onInputChange(e) {
    return this.props.onChange(e.target.value)
  }

  _buildOptions() {
    let options
    if (this.props.showValueAsOption && this.props.options.indexOf(this.props.value) === -1) {
      options = this.props.options.concat(this.props.value)
    } else {
      options = this.props.options
    }
    return _.map(options, (option) => {
      if (_.isString(option)) {
        return {
          displayName: option,
          value: option
        }
      } else if (option == null) {
        return {
          displayName: "None",
          value: EMPTY_VALUE
        }
      }
      return option
    })
  }

  _renderOptions() {
    const options = this._buildOptions()
    return _.map(options, (option) => {
      return (
        <option value={this._normalizeValue(option.value)}
          key={option.value}>
          {option.displayName}
        </option>
      )
    })
  }


  /* Rendering */

  render() {
    let style = baseStyle
    if (this.props.width) {
      style = Object.assign({}, baseStyle, {
        width: this.props.width,
      })
    }

    return (
      <select className={this.props.className}
        style={style}
        value={this._normalizeValue(this.props.value)}
        onChange={this._onInputChange}>
        {this._renderOptions()}
      </select>
    )
  }

}

SelectInput.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.string,
  options: React.PropTypes.array.isRequired,
}

SelectInput.defaultProps = {
  className: '',
  style: {},
  showValueAsOption: false,
}

export default SelectInput
