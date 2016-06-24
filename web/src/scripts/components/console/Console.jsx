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

import React, { Component, PropTypes, } from 'react'

import PackagerConsole from './PackagerConsole'
import PackagerSwitch from './PackagerSwitch'

import { ProcessStatus, } from '../../constants/ProcessStatus'

const tabBarHeight = 32

const style = {
  termContainer: {
    zIndex: '5',
    backgroundColor: 'rgb(35,36,38)',
    maxHeight: '300px',
    overflow: 'hidden',
  },
  termBar: {
    height: tabBarHeight,
    backgroundColor: 'rgb(35,36,38)',
    borderTop: '1px solid rgb(16,16,16)',
    borderBottom: '1px solid rgb(16,16,16)',
    paddingLeft: 8,
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
  },
  termTitleText: {
    fontSize: 11,
    lineHeight: `${tabBarHeight - 2}px`,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  },
  iconBaseStyle: {
    width: 18,
    height: 18,
    position: 'relative',
    top: 5,
    marginRight: 6,
    WebkitMaskSize: '32px 18px',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    backgroundColor: 'rgba(255,255,255,0.6)',
    display: 'inline-block',
  }
}

class Console extends Component {

  _packagerDisplay() {
    if (!this.props.consoleOpen) {
      return null
    }
    return (
      <PackagerConsole
        packagerOutput={this.props.packagerOutput}
        initialScrollHeight={this.props.initialScrollHeight}
        saveScrollHeight={this.props.saveScrollHeight}/>
    )
  }

  _getConsoleAnimatedClassModifier() {
    if (this.props.consoleOpen) {
      return ' open-term'
    } else {
      return ' close-term'
    }
  }

  render() {
    const containerClass = 'flex-fixed' + this._getConsoleAnimatedClassModifier()

    const iconName = this.props.consoleOpen ? 'collapse' : 'expand'
    const iconStyle = Object.assign({}, style.iconBaseStyle, {
      WebkitMaskImage: `-webkit-image-set(` +
        `url('./icons/icon-${iconName}.png') 1x, ` +
        `url('./icons/icon-${iconName}@2x.png') 2x` +
      `)`,
    })

    return (
      <div className={containerClass} style={style.termContainer}>
        <div className='flex-fixed' style={style.termBar} onClick={this.props.toggleConsole}>
          <div>
            <div style={iconStyle} />
            <span style={style.termTitleText}>{'Packager Output'}</span>
          </div>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end', }}>
            <PackagerSwitch
              isRunning={this.props.packagerStatus == ProcessStatus.ON}
              onClick={(e) => {
                e.stopPropagation()
                this.props.togglePackager(this.props.packagerStatus)
              }}/>
          </div>
        </div>
        {this._packagerDisplay()}
      </div>
    )
  }
}

Console.propTypes = {
  packagerOutput: PropTypes.string,
  packagerStatus: PropTypes.number.isRequired,
  togglePackager: PropTypes.func.isRequired,
  toggleConsole: PropTypes.func.isRequired,
  consoleOpen: PropTypes.bool.isRequired,
  initialScrollHeight: PropTypes.number.isRequired,
  saveScrollHeight: PropTypes.func.isRequired,
}

export default Console
