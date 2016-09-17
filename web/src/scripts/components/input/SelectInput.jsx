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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const EMPTY_VALUE = "__DECO_EMPTY__"

const stylesCreator = (theme, {width}) => ({
  select: {
    position: 'relative',
    left: -1,
    fontSize: 12,
    width: width ? width : 'initial',
  },
})

@StylesEnhancer(stylesCreator, ({width}) => ({width}))
@pureRender
export default class SelectInput extends Component {

  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string,
    options: React.PropTypes.array.isRequired,
  }

  static defaultProps = {
    className: '',
    style: {},
    showValueAsOption: false,
  }

  normalizeValue(value) {
    return value == null ? EMPTY_VALUE : value
  }

  onInputChange = (e) => this.props.onChange(e.target.value)

  buildOptions() {
    const {value, options, showValueAsOption} = this.props

    let normalized
    if (showValueAsOption && !options.includes(value)) {
      normalized = options.concat(value)
    } else {
      normalized = options
    }

    return normalized.map((option) => {
      if (_.isString(option)) {
        return {
          displayName: option,
          value: option,
        }
      } else if (option == null) {
        return {
          displayName: "None",
          value: EMPTY_VALUE,
        }
      }
      return option
    })
  }

  renderOptions() {
    const options = this.buildOptions()

    return options.map(({value, displayName}) => {
      return (
        <option
          key={value}
          value={this.normalizeValue(value)}
        >
          {displayName}
        </option>
      )
    })
  }

  render() {
    const {styles, className, value} = this.props

    return (
      <select
        className={className}
        style={styles.select}
        value={this.normalizeValue(value)}
        onChange={this.onInputChange}
      >
        {this.renderOptions()}
      </select>
    )
  }
}
