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

import ToggleButton from 'react-toggle-button'

const style = {
  container: {
    position: 'relative',
    height: 30,
    marginRight: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  termTitleText: {
    marginRight: 7,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  },
}

class PackagerSwitch extends Component {
  render() {
    return (
      <div style={style.container}>
        <div style={style.termTitleText}>
          {this.props.isRunning ? 'Packager running' : 'Run packager'}
        </div>
        <div onMouseDown={this.props.onClick} onClick={(e) => {
            e.stopPropagation()
          }}>
          <ToggleButton
            value={this.props.isRunning}
            colors={{
              active: {
                base: 'rgb(18, 80, 146)',
              }
            }}
            inactiveLabelStyle={{
              marginRight: 2,
            }}
            onToggle={() => { }} />
        </div>
      </div>
    )
  }
}

export default PackagerSwitch
