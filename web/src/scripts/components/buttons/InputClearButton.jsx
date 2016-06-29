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
import _ from 'lodash'

const defaultStyle = {
  width: '14px',
  height: '14px',
  position: 'absolute',
  top: '15px',
  right: '15px',
  fontSize: '14px',
  WebkitAppearance: 'searchfield-cancel-button',
}

const InputClearButton = ({ className, style, onClick }) => (
  <div className={className}
    style={_.extend({}, defaultStyle, _.cloneDeep(style))}
    onClick={onClick} />
)

InputClearButton.defaultProps = {
  className: '',
  style: {},
  onClick: () => {},
}

export default InputClearButton
