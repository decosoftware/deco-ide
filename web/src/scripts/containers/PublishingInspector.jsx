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
import { connect } from 'react-redux'

import PaneHeader from '../components/headers/PaneHeader'
import NoContent from '../components/display/NoContent'
import {toValue} from '../utils/Parser'

const style = {
  display: 'flex',
  flex: '1 0 auto',
  flexDirection: 'column',
  alignItems: 'stretch',
}

const PublishingInspector = ({decoDoc}) => {
  return (
    <div style={style}>
      <PaneHeader text={'Publishing'} />
    </div>
  )
}

export default connect()(PublishingInspector)
