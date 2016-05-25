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

import React, { Component, } from 'react'

const FormLabel = ({label, labelWidth, disabled}) => {
  let style = {
    lineHeight: '30px',
    color: 'rgb(73,73,73)',
    fontSize: 11,
    flex: labelWidth ? `0 0 ${labelWidth}px` : `1 1 auto`,
    letterSpacing: 0.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    paddingLeft: 10,
    paddingRight: 5,
  }

  if (disabled) {
    style = Object.assign({}, style, {
      color: 'rgb(170,170,170)',
    })
  }

  return (
    <div style={style}
      title={label}>
      {label}
    </div>
  )
}

FormLabel.defaultProps = {}

export default FormLabel
