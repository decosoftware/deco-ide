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
import {scaleForRetina, scaleAndApplyStylesForRetina, } from '../../utils/scaleForRetina'
import Display from '../../events/Display'
import Enum from '../../utils/Enum'

const GROUP_POSITION = Enum(
  'NONE',
  'LEFT',
  'CENTER',
  'RIGHT'
)

const BUTTON_STATE = Enum(
  'DEFAULT',
  'ACTIVE'
)

const THEME = Enum(
  'LIGHT',
  'DARK',
  'PLAIN'
)

class ToolbarButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pressed: false,
      pressIsControlled: false,
    }
    this._forceUpdate = () => this.forceUpdate()
  }

  componentDidMount() {
    Display.on('scale', this._forceUpdate)
  }

  componentWillUnmount() {
    Display.removeListener('scale', this._forceUpdate)
  }

  componentWillReceiveProps(nextProps) {
    const {pressed} = nextProps
    if (_.isBoolean(pressed)) {
      this.setState({
        pressed,
        pressIsControlled: true,
      })
    }
  }

  _buildButtonStyle(width) {
    let buttonStyle = {
      width: width,
      height: 23,
      background: 'linear-gradient(rgb(253,253,254), rgb(240,240,241))',
      boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.15), inset 0px 1px 0px 0px rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(151,151,151) rgb(151,151,151) rgb(151,151,151) rgb(151,151,151)',
    }

    if (this.props.theme === THEME.PLAIN) {
      buttonStyle = _.extend({}, buttonStyle, {
        boxShadow: null,
        borderWidth: 0,
        background: null,
      })
    }

    // Active state
    if (this.props.buttonState === BUTTON_STATE.ACTIVE) {
      switch (this.props.theme) {
        case THEME.DARK:
          buttonStyle = _.extend({}, buttonStyle, {
            background: 'linear-gradient(rgb(107,107,110), rgb(91,91,93))',
          })
        break
        case THEME.PLAIN:
          buttonStyle = _.extend({}, buttonStyle, {
            background: 'rgb(200,200,200)',
          })
        break
      }
    }

    // Pressed state
    if (this.state.pressed) {
      if (this.props.theme === THEME.DARK &&
          this.props.buttonState === BUTTON_STATE.ACTIVE) {
        buttonStyle = _.extend({}, buttonStyle, {
          background: 'linear-gradient(rgb(77,77,80), rgb(61,61,67))',
        })
      } else if (this.props.theme === THEME.PLAIN) {
        buttonStyle = _.extend({}, buttonStyle, {
          background: 'rgb(220,220,221)',
        })
      } else {
        buttonStyle = _.extend({}, buttonStyle, {
          background: 'linear-gradient(rgb(220,220,221), rgb(207,207,208))',
        })
      }
    }

    if (this.props.theme === THEME.PLAIN) {
      buttonStyle = _.extend({}, buttonStyle, {
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
      })
    } else {
      switch (this.props.groupPosition) {
        case GROUP_POSITION.LEFT:
          buttonStyle = _.extend({}, buttonStyle, {
            borderTopRightRadius: 0,
            borderTopLeftRadius: 3,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 3,
            borderRightWidth: 1,
          })
        break
        case GROUP_POSITION.CENTER:
          buttonStyle = _.extend({}, buttonStyle, {
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeftWidth: 0,
            borderRightWidth: 1,
          })
        break
        case GROUP_POSITION.RIGHT:
          buttonStyle = _.extend({}, buttonStyle, {
            borderTopRightRadius: 3,
            borderTopLeftRadius: 0,
            borderBottomRightRadius: 3,
            borderBottomLeftRadius: 0,
            borderLeftWidth: 0,
          })
        break
        case GROUP_POSITION.NONE:
          buttonStyle = _.extend({}, buttonStyle, {
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            borderBottomRightRadius: 3,
            borderBottomLeftRadius: 3,
          })
        break
      }
    }

    return scaleAndApplyStylesForRetina(buttonStyle, {
      x1: {
        borderColor: 'rgba(151,151,151,0.5) rgba(151,151,151,0.5) rgba(151,151,151,0.5) rgba(151,151,151,0.5)',
        boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.07), inset 0px 1px 0px 0px rgba(255,255,255,0.12)',
      }
    })
  }

  _buildIconStyle() {
    let backgroundColor = 'rgb(103,103,103)'
    if (this.props.theme === THEME.LIGHT &&
        this.props.buttonState === BUTTON_STATE.ACTIVE) {
      backgroundColor = 'rgb(22,128,250)'
    }

    let iconStyle = scaleForRetina({
      width: 32,
      height: 18,
      WebkitMaskSize: '32px 18px',
      WebkitMaskPosition: 'center',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskImage:
        `-webkit-image-set(url('./icons/icon-${this.props.icon}.png') 1x, ` +
        `url('./icons/icon-${this.props.icon}@2x.png') 2x)`,
      backgroundColor: backgroundColor,
      display: 'inline-block',
    }, false)

    if (this.state.pressed) {
      iconStyle = _.extend({}, iconStyle, {
        backgroundColor: 'rgb(60,60,60)',
      })
    }

    if (this.props.theme === THEME.DARK &&
        this.props.buttonState === BUTTON_STATE.ACTIVE) {
      if (this.state.pressed) {
        iconStyle = _.extend({}, iconStyle, {
          backgroundColor: 'rgb(180,180,180)',
        })
      } else {
        iconStyle = _.extend({}, iconStyle, {
          backgroundColor: 'white',
        })
      }
    }

    return iconStyle
  }

  _buildTextStyle() {
    let textStyle = {
      paddingTop: 3,
      lineHeight: '11px',
      fontSize: '10px',
      fontWeight: '400',
      letterSpacing: 0.35,
      color: 'rgb(73,73,73)',
      width: this.props.width,
      textAlign: 'center',
      cursor: 'default',
    }

    if (this.props.theme === THEME.PLAIN) {
      textStyle = _.extend({}, textStyle, {
        paddingBottom: 4,
        paddingTop: 0,
        borderRadius: 3,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      })

      if (this.props.buttonState === BUTTON_STATE.ACTIVE) {
        textStyle = _.extend({}, textStyle, {
          backgroundColor: 'rgb(200,200,200)',
        })
      }

      if (this.state.pressed) {
        textStyle = _.extend({}, textStyle, {
          backgroundColor: 'rgb(220,220,221)',
        })
      }
    }

    return textStyle
  }

  render() {
    const {pressIsControlled} = this.state
    const width = this.props.width

    const buttonStyle = this._buildButtonStyle(width)
    const iconStyle = this._buildIconStyle()
    const textStyle = this._buildTextStyle()

    const style = _.extend({
      fontSize: '11px',
      position: 'relative',
      width: width,
      alignItems: 'center',
      WebkitAppRegion: 'no-drag',
    }, _.cloneDeep(this.props.style))

    return (
      <span className={this.props.className + ' vbox'}
        id={this.props.id}
        style={style}
        onClick={this.props.onClick}>
        <div style={{width: width, height: 23}}
          onMouseDown={() => ! pressIsControlled && this.setState({pressed: true})}
          onMouseUp={() => ! pressIsControlled && this.setState({pressed: false})}
          onMouseLeave={() => ! pressIsControlled && this.setState({pressed: false})}>
          <div style={buttonStyle}>
            <div style={iconStyle} />
          </div>
        </div>
        <div style={textStyle}>
          {this.props.text}
        </div>
      </span>
    )
  }
}

ToolbarButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  width: PropTypes.number,
  onClick: PropTypes.func,
  groupPosition: PropTypes.number,
  buttonState: PropTypes.number,
  theme: PropTypes.number,
  id: PropTypes.string,
}

ToolbarButton.defaultProps = {
  className: '',
  style: {},
  width: 52,
  onClick: _.identity,
  groupPosition: GROUP_POSITION.NONE,
  buttonState: BUTTON_STATE.DEFAULT,
  theme: THEME.LIGHT,
}

ToolbarButton.GROUP_POSITION = GROUP_POSITION
ToolbarButton.BUTTON_STATE = BUTTON_STATE
ToolbarButton.THEME = THEME

export default ToolbarButton
