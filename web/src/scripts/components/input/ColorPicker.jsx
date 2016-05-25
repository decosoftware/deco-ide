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
import Colr from 'colr'
import ReactColorPicker from 'react-colorpicker'

import StringInput from './StringInput'
import NumberInput from './NumberInput'
import DragToChangeValue from './DragToChangeValue'
import { parseColor } from '../../utils/CSSColorParser'

const DEFAULT_COLORS = [
  [
    'rgb(208,2,27)',
    'rgb(245,166,35)',
    'rgb(248,231,28)',
    'rgb(139,87,42)',
    'rgb(126,211,33)',
    'rgb(65,117,5)',
    'rgb(189,16,224)',
    'rgb(144,19,254)',
    'rgb(0,122,255)',
  ],
  [
    'rgb(74,144,226)',
    'rgb(80,227,194)',
    'rgb(184,233,134)',
    'rgb(0,0,0)',
    'rgb(74,74,74)',
    'rgb(103,103,103)',
    'rgb(155,155,155)',
    'rgb(210,210,210)',
    'rgb(255,255,255)',
  ],
]

const numberInputAreaStyle = {
  marginTop: '9px'
}
const containerStyle = {
  width: "62px",
  display: "inline-block"
}
const smallContainerStyle = {
  width: "32px",
  display: "inline-block",
  marginLeft: '5px'
}
const inputLabelStyle = {
  fontSize: "11px",
  lineHeight: "16px",
  textAlign: "center"
}
const draggableInputLabelStyle = {
  fontSize: "11px",
  lineHeight: "16px",
  textAlign: "center",
  cursor: "row-resize"
}
const subtreeContainerStyle = {
  position: 'absolute',
  padding: '10px',
  paddingBottom: '5px',
  background: 'rgb(252,251,252)',
  borderRadius: '3px',
  boxShadow: '0 2px 8px 1px rgba(0,0,0,0.3)',
  border: '1px solid rgba(0,0,0,0.2)'
}
const colorBoxContainerStyle = {
  borderTop: '1px solid #E8E8E8',
  margin: '4px -10px',
  padding: '2px 12px',
}
const colorBoxRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 8,
}

class ColorPicker extends Component {

  constructor(props) {
    super(props)

    this.state = this.getStateFromColorString(props.value)

    this.setColorComponent = this.setColorComponent.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    return this.setState(this.getStateFromColorString(nextProps.value))
  }

  /* Colorpicker */

  getStateFromColorString(value) {
    const parsed = parseColor(value)

    if (! parsed) {
      return {
        color: Colr.fromRgb(0, 0, 0),
        opacity: 100,
      }
    }

    const [r, g, b, a] = parsed
    return {
      color: Colr.fromRgb(r, g, b),
      opacity: parseInt(a * 100)
    }
  }

  getColorString(color, opacity) {
    return "rgba(" + (color.toRgbArray().join(',')) + "," + (opacity / 100) + ")"
  }

  handleChange(color, opacity) {
    this.setState({internalHex: null})
    this.props.onChange(this.getColorString(color, opacity))
  }

  setColorComponent(name, value) {
    if (name === 'a') {
      this.handleChange(this.state.color, value)
    } else {
      const rgbObject = this.state.color.toRgbObject()
      rgbObject[name] = value
      this.handleChange(Colr.fromRgbObject(rgbObject), this.state.opacity)
    }
  }

  setHex(value) {
    if (value.length < 6) {
      this.setState({internalHex: value})
      return
    } else if (value.length > 6) {
      value = value.slice(0, 6)
    }

    try {
      const color = Colr.fromHex(value)
      this.handleChange(color, 100)
    } catch (e) {
      this.setState({internalHex: value})
    }
  }

  /* Rendering */

  render() {
    const {r, g, b} = this.state.color.toRgbObject()
    const hex = this.state.color.toHex()
    const rgbString = `rgb(${r},${g},${b})`

    let hexWithoutHashtag
    if (typeof this.state.internalHex === 'string') {
      hexWithoutHashtag = this.state.internalHex
    } else {
      // Remove the hashtag
      hexWithoutHashtag = hex.slice(1).toUpperCase()
    }

    const colorComponents = [
      ['r', r, 0, 255],
      ['g', g, 0, 255],
      ['b', b, 0, 255],
      ['a', this.state.opacity, 0, 100],
    ]

    return (
      <div style={subtreeContainerStyle}>
        <ReactColorPicker
          color={hex}
          opacity={this.state.opacity}
          onChange={this.handleChange}
        />
        <div className='hbox'
          style={numberInputAreaStyle}>
          <div style={containerStyle}>
            <StringInput
              width={62}
              value={hexWithoutHashtag}
              onChange={(value) => {
                this.setHex(value)
              }} />
            <div style={inputLabelStyle}>
              {'Hex'}
            </div>
          </div>
          {
            _.map(colorComponents, ([name, value, min, max]) => {
              const onChange = (value) => {
                this.setColorComponent(name, value)
              }
              return (
                <div key={name}
                  style={smallContainerStyle}>
                  <NumberInput
                    width={32}
                    value={value}
                    onChange={onChange} />
                  <DragToChangeValue
                    style={draggableInputLabelStyle}
                    value={value}
                    min={min}
                    max={max}
                    onChange={onChange}>
                    {name.toUpperCase()}
                  </DragToChangeValue>
                </div>
              )
            })
          }
        </div>
        <div style={colorBoxContainerStyle}>
          {
            _.map(DEFAULT_COLORS, (colors, i) => {
              return (
                <div
                  key={i}
                  style={colorBoxRowStyle}>
                  {
                    _.map(colors, (color) => {
                      const colorBoxStyle = {
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: color,
                        boxShadow: color === rgbString ?
                            '0 0 2px 1px rgba(20,101,232,1), 0 0 0 1px rgba(0,0,0,0.2) inset' :
                            '0 0 0 1px rgba(0,0,0,0.2) inset',
                      }
                      return (
                        <div
                          key={color}
                          style={colorBoxStyle}
                          onClick={this.props.onChange.bind(this, color)} />
                      )
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

ColorPicker.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.string.isRequired,
}

ColorPicker.defaultProps = {
  className: '',
  style: {},
}

export default ColorPicker
