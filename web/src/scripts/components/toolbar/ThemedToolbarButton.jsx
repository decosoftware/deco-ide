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
import _ from 'lodash'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const GROUP_POSITION_BACKGROUND = {
  left: {
    borderImageWidth: '3px 0px 4px 3px',
  },
  right: {
    borderImageWidth: '3px 3px 4px 0px',
  },
  center: {
    borderImageWidth: '3px 0px 4px 0px',
  },
  none: {
    borderImageWidth: '3px 3px 4px 3px',
  },
}

const stylesCreator = ({fonts}, props) => {
  const {minWidth, height, icon, active, groupPosition} = props

  const styles = {
    button: {
      WebkitAppRegion: 'no-drag',
      position: 'relative',
      height,
      minWidth: minWidth,
      marginTop: 2,
      borderImageSource: 'url("./images/toolbar-button-background-normal@2x.png")',
      borderImageSlice: '6 6 8 6 fill',
      borderImageOutset: '0px 0px 0px 0px',
      borderImageRepeat: 'repeat stretch',
      ...GROUP_POSITION_BACKGROUND[groupPosition],
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 6,
      paddingRight: 6,
    },
    icon: {
      position: 'relative',
      top: -1,
      width: 18,
      height: 16,
      WebkitMaskSize: '32px 18px',
      WebkitMaskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskImage: `-webkit-image-set(
        url('./icons/icon-${icon}.png') 1x,
        url('./icons/icon-${icon}@2x.png') 2x
      )`,
      backgroundColor: active ? 'rgb(22,128,250)' : 'rgb(103,103,103)',
      display: 'inline-block',
    },
    text: {
      ...fonts.toolbarButton,
      whiteSpace: 'nowrap',
    },
  }

  styles.buttonPressed = {
    ...styles.button,
    borderImageSource: 'url("./images/toolbar-button-background-active@2x.png")',
  }

  styles.iconPressed = {
    ...styles.icon,
    backgroundColor: 'rgb(60,60,60)',
  }

  return styles
}

@StylesEnhancer(stylesCreator, props => props)
@pureRender
export default class ToolbarButton extends Component {

  static propTypes = {
    id: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.string,
    minWidth: PropTypes.number,
    height: PropTypes.number,
    onClick: PropTypes.func,
    groupPosition: PropTypes.string,
  }

  static defaultProps = {
    minWidth: 52,
    height: 25,
    onClick: () => {},
    groupPosition: 'none',
  }

  state = {pressed: false}

  onMouseDown = () => this.setState({pressed: true})

  onMouseUp = () => this.setState({pressed: false})

  onMouseLeave = () => this.setState({pressed: false})

  render() {
    const {styles, id, onClick, icon, text, opened} = this.props
    const {pressed} = this.state

    const pressedOrOpened = pressed || opened

    return (
      <div
        id={id}
        style={pressedOrOpened ? styles.buttonPressed : styles.button}
        onClick={onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
      >
        {icon && <div style={pressedOrOpened ? styles.iconPressed : styles.icon} />}
        {text && <div style={styles.text}>{text}</div>}
      </div>
    )
  }
}
