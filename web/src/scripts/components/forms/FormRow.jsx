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

import FormTwoStateLabel from './FormTwoStateLabel'
import FormLabel from './FormLabel'

const style = {
  height: 30,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: 10,
  minWidth: 0,
}

const FormRow = ({
  children,
  label,
  inset,
  labelWidth,
  inputWidth,
  disabled,
  onClickLabel,
  onLabelChange,
  onLabelPositionChange,
  labelEnabled,
  statefulLabel,
}) => {
  const rowStyle = Object.assign({}, style, {
    paddingLeft: inset,
  })

  const inputStyle = {
    flex: inputWidth ? `0 0 ${inputWidth}px` : `1 1 auto`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }

  if (disabled) {
    children = React.Children.map(children, (child) => {
      return React.cloneElement(child, {disabled: true})
    })
  }

  return (
    <div style={rowStyle}>
      {
        statefulLabel ? (
          <FormTwoStateLabel
            label={label}
            labelWidth={labelWidth ? labelWidth - inset - 10 : null}
            enabled={labelEnabled}
            disabled={disabled}
            onClick={onClickLabel}
            onChange={onLabelChange}
            onLabelPositionChange={onLabelPositionChange} />
        ) : (
          <FormLabel
            label={label}
            labelWidth={labelWidth ? labelWidth - inset : null}
            disabled={disabled} />
        )
      }
      <div style={inputStyle}>
        {children}
      </div>
    </div>
  )
}

FormRow.defaultProps = {
  inset: 0,
  statefulLabel: false,
  onClickLabel: () => {},
  onLabelChange: () => {},
  onLabelPositionChange: () => {},
}

export default FormRow
