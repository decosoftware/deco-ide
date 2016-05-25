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

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  WebkitAppRegion: 'drag',
  width: '100%',
  justifyContent: 'space-between',
  paddingBottom: 5,
}

const titleStyle = {
  WebkitAppRegion: 'drag',
  textAlign: 'center',
  height: 10,
  lineHeight: '14px',
  fontSize: 14,
  color: 'rgb(58, 58, 58)',
  paddingTop: 4,
}

const Toolbar = ({children, title, height}) => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    flex: `0 0 ${height}px`,
    width: '100%',
    position: 'relative',
    background: 'linear-gradient(rgb(238,237,238), rgb(231,230,231))',
    borderBottom: '1px solid rgb(224,224,226)',
    fontSize: 12,
    WebkitAppRegion: 'drag',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  }

  return (
    <div className={'helvetica-smooth'}
      style={style}>
      <div style={titleStyle}>
        {title}
      </div>
      <div style={containerStyle}>
        {children}
      </div>
    </div>
  )
}

Toolbar.defaultProps = {
  height: 60,
  title: '',
}

export default Toolbar
