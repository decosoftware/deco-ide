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
import React, { Component, } from 'react'

class CheckboxInput extends Component {

  constructor(props) {
    super(props)

    this.state = {}
    this._onInputChange = this._onInputChange.bind(this)
  }

  _onInputChange(e) {
    return this.props.onChange(! this.props.value)
  }

  render() {
    return (
      <input className={this.props.className}
        type={'checkbox'}
        disabled={this.props.disabled}
        checked={this.props.value}
        onChange={this._onInputChange}
        onContextMenu={this.props.onContextMenu}/>
    )
  }

}

CheckboxInput.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.bool.isRequired,
  disabled: React.PropTypes.bool,
}

CheckboxInput.defaultProps = {
  className: '',
  style: {},
  disabled: false,
}

export default CheckboxInput
