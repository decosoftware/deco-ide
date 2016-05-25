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
import { connect } from 'react-redux'

import { resizeWindow } from '../actions/uiActions'

import DecoLogo from '../components/display/DecoLogo'

class Error extends Component {
  componentWillMount(){
    this.props.dispatch(resizeWindow({
      width: 640,
      height: 450,
    }))
  }
  render() {
    return (
      <div className='vbox' style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#124887',
          overflow: 'hidden',
        }}>
          <div style={{
              margin: 'auto',
            }}>
            <DecoLogo/>
          </div>
        </div>
    )
  }
}

export default connect()(Error)
