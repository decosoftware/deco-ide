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

import SimpleButton from './SimpleButton'
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors, fonts}) => {
  const styles = {
    main: {
      width: '100%',
      height: 35,
      position: 'relative',
      ...fonts.regularSubtle,
      color: 'rgba(255,255,255,0.3)',
      cursor: 'default',
      backgroundColor: colors.tabs.background,
    },
    text: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      padding: '0 10px',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    close: {
      width: 20,
      height: 29,
      position: 'absolute',
      right: 0,
      top: 0,
      paddingTop: 5,
      paddingLeft: 2,
      backgroundColor: colors.tabs.background,
      boxShadow: `-4px 0 4px ${colors.tabs.background}`,
    },
    closeText: {
      opacity: 0,
      transition: 'opacity 0.2s',
    },
    closeTextVisible: {
      opacity: 1,
    },
    closeTextHover: {
      opacity: 0.5,
    },
    closeTextActive: {
      opacity: 0.75,
    },
  }

  styles.mainFocused = {
    ...styles.main,
    color: 'rgba(255,255,255,0.7)',
    boxShadow: `0 -2px ${colors.tabs.highlight} inset`,
  }

  styles.closeFocused = {
    ...styles.close,
    backgroundColor: colors.tabs.background,
    boxShadow: `-4px 0 4px ${colors.tabs.background}`,
  }

  return styles
}

@StylesEnhancer(stylesCreator)
export default class extends Component {

  state = {}

  onMouseEnter = () => this.setState({hover: true})

  onMouseLeave = () => this.setState({hover: false})

  onCloseClick = (e) => {
    const {onClose} = this.props

    e.stopPropagation()
    onClose()
  }

  render() {
    const {styles, focused, title, onFocus, children} = this.props
    const {hover} = this.state
    const closeTextStyle = hover ? {...styles.closeText, ...styles.closeTextVisible} : styles.closeText

    return (
      <div
        style={focused ? styles.mainFocused : styles.main}
        title={title}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={onFocus}
      >
        <div style={styles.text}>
          {children}
        </div>
        <div style={focused ? styles.closeFocused : styles.close}>
          <SimpleButton
            onClick={this.onCloseClick}
            defaultStyle={closeTextStyle}
            activeStyle={{...closeTextStyle, ...styles.closeTextActive}}
            hoverStyle={{...closeTextStyle, ...styles.closeTextHover}}
            innerStyle={{}}>
            ×
          </SimpleButton>
        </div>
      </div>
    )
  }
}
