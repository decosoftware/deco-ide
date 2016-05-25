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

import React, { Component, PropTypes } from 'react'

const style = {
  backgroundColor: 'white',
  height: 32,
  width: '100%',
  lineHeight: '32px',
  textAlign: 'center',
  color: 'rgb(103,103,103)',
  fontSize: 12,
  fontWeight: 500,
  borderBottom: '1px solid rgb(224,224,224)'
}

const PaneHeader = ({text}) => {
  return (
    <div
      className={'helvetica-smooth'}
      style={style}>
      {text}
    </div>
  )
}

export default PaneHeader
