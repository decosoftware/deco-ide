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
import { StylesEnhancer } from 'react-styles-provider'

const tabBarHeight = 36

const stylesCreator = ({colors, fonts}) => {
  return {
    termContainer: {
      zIndex: '5',
      backgroundColor: colors.console.background,
      maxHeight: '300px',
      minHeight: tabBarHeight,
      overflow: 'hidden',
    },
    termBar: {
      height: tabBarHeight,
      backgroundColor: colors.console.background,
      paddingLeft: 10,
      cursor: 'pointer',
      overflow: 'hidden',
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    termTitleText: {...fonts.regularSubtle},
    iconBaseStyle: {
      width: 15,
      height: 15,
      position: 'relative',
      top: -1,
      marginRight: 8,
      WebkitMaskSize: '100%',
      WebkitMaskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      backgroundColor: 'rgba(255,255,255,0.6)',
    },
    switchContainer: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    }
  }
}

@StylesEnhancer(stylesCreator)
class Console extends Component {

  renderPackagerDisplay() {
    const {consoleOpen, packagerOutput, initialScrollHeight, saveScrollHeight} = this.props

    if (!consoleOpen) {
      return null
    }

    return (
      <PackagerConsole
        packagerOutput={packagerOutput}
        initialScrollHeight={initialScrollHeight}
        saveScrollHeight={saveScrollHeight}
      />
    )
  }

  render() {
    const {styles, consoleOpen, packagerStatus, toggleConsole, togglePackager} = this.props

    const containerClass = 'flex-fixed ' + (consoleOpen ? 'open-term' : 'close-term')

    const iconName = consoleOpen ? 'collapse' : 'expand'
    const iconStyle = {
      ...styles.iconBaseStyle,
      WebkitMaskImage: `-webkit-image-set(` +
        `url('./icons/icon-${iconName}.png') 1x, ` +
        `url('./icons/icon-${iconName}@2x.png') 2x` +
      `)`,
    }

    return (
      <div className={containerClass} style={styles.termContainer}>
        <div className='flex-fixed' style={styles.termBar} onClick={toggleConsole}>
          <div style={iconStyle} />
          <div style={styles.termTitleText}>{'Console Output'}</div>
          <div style={styles.switchContainer}>
            <PackagerSwitch
              isRunning={packagerStatus == ProcessStatus.ON}
              onClick={(e) => {
                e.stopPropagation()
                togglePackager(this.props.packagerStatus)
              }}/>
          </div>
        </div>
        {this.renderPackagerDisplay()}
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
