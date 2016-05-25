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

import LandingButton from '../buttons/LandingButton'

const style = {
  flexDirection: 'row',
  alignItems: 'stretch',
  display: 'flex',
  width: 280,
}

const listStyle = {
  flex: '0 0 50%',
}

const getRowStyle = (options, i) => {
  return {
    marginBottom: i === options.length - 1 ? 0 : 6,
    marginRight: 10,
    marginLeft: 10,
  }
}

const renderList = (options) => {
  return _.map(options, ({text, action}, i) => (
    <div key={i} style={getRowStyle(options, i)}>
      <LandingButton onClick={action}>
        {text}
      </LandingButton>
    </div>
  ))
}

class TwoColumnMenu extends Component {
  render() {
    const {column1 = [], column2 = []} = this.props

    return (
      <div className={'helvetica-smooth'} style={style}>
        <div style={listStyle}>
          {renderList(column1)}
        </div>
        <div style={listStyle}>
          {renderList(column2)}
        </div>
      </div>
    )
  }
}
export default TwoColumnMenu
