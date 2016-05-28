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

import DecoIcon from '../components/display/DecoIcon'
import IndeterminateProgressBar from '../components/display/IndeterminateProgressBar'

const containerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgb(255,255,255)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'row',
}
const upgradeStyle = {
  color: 'rgb(80,80,80)',
  fontSize: 26,
  fontFamily: '"Helvetica Neue", sans-serif',
  marginLeft: 20,
}
const flex = {
  display: 'flex',
}
const centered = {
  alignItems: 'center',
  justifyContent: 'center',
}
const column = {
  flexDirection: 'column',
}
const row = {
  flexDirection: 'row',
}
const verticalFlex = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}
const horizontalFlex = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
}

class Upgrader extends Component {
  constructor(props) {
    super(props)
  }
  _paramsByUpgradeStatus() {
    switch (this.props.status) {
      case 'pending':
        return {
          subject: 'Installing Update',
          details: 'This may take a few minutes.',
          barColor: 'rgba(61,176,222,0.4)',
          animate: true,
        }
      case 'failed':
        return {
          subject: 'Update Failure',
          details: 'The application will now close.',
          barColor: "rgba(255,74,74,1)",
          animate: false,
        }
      case 'success':
        return {
          subject: 'Update Successful',
          details: 'A new window will now open.',
          barColor: "rgba(103,205,109,1)",
          animate: false,
        }
    }
  }

  render() {
    const {subject, details, barColor, animate} = this._paramsByUpgradeStatus()
    return (
      <div style={containerStyle}>
        <div style={{...flex, ...column, ...centered, flex: 1, marginLeft: 20,}}>
          <DecoIcon />
        </div>
        <div style={{...flex, ...row, ...centered, flex: 2, }}>
          <div style={{...flex, ...column, flex: 1, }}>
            <div style={upgradeStyle}>
                {subject}
            </div>
            <div style={{...upgradeStyle, fontSize: 14, marginTop: 3,}}>
                {details}
            </div>
          </div>
        </div>
        <IndeterminateProgressBar
          style={{
            position: 'absolute',
            height: 6,
            width: '100%',
            backgroundColor: barColor,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
          }}
          barStyle={{
            background: '-webkit-radial-gradient(rgba(61,176,222,1) 20%, rgba(61,176,222,0) 80%)'
          }}
          animate={animate} />
        </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    status: state.ui.upgrade.status
  }
}

export default connect(mapStateToProps)(Upgrader)
