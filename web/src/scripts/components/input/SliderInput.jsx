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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

let SLIDER_REF = 'slider'

const stylesCreator = ({input, colors}, {type, width, height, trackHeight, disabled, knobWidth}) => {
  height = type === 'platform' ? 20 : height
  const trackRadius = trackHeight / 2

  return {
    main: {
      position: 'relative',
      flex: `1 0 ${width || 0}px`,
      width: width ? width : 0,
      height: height,
      opacity: disabled ? 0.5 : 1,
      display: 'flex',
    },
    trackContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    track: {
      flex: 1,
      height: trackHeight,
      backgroundColor: type === 'platform' ? 'rgb(179,179,179)' : colors.divider,
      display: 'flex',
      alignItems: 'stretch',
      borderRadius: trackRadius,
    },
    trackActive: {
      background: disabled ? 'rgb(140,140,140)' : 'rgb(54,159,249)',
      borderRadius: trackRadius,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    knobContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    knob: {
      position: 'relative',
      width: knobWidth,
      height: knobWidth,
      borderRadius: '50%',
      backgroundColor: 'white',
      cursor: 'pointer',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
    },
  }
}

@StylesEnhancer(stylesCreator, props => props)
@pureRender
export default class SliderInput extends Component {

  static propTypes = {
    value: React.PropTypes.number,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    onChange: React.PropTypes.func,
    disabled: React.PropTypes.bool,
  }

  static defaultProps = {
    value: 0,
    min: 0,
    max: 100,
    height: 30,
    trackHeight: 3,
    knobWidth: 12,
    onChange: _.identity,
    disabled: false,
  }

  state = {
    bounds: {min: 0, max: 1}
  }

  componentDidMount() {
    this.updateBounds()
  }

  componentWillReceiveProps() {
    this.updateBounds()
  }

  updateBounds() {
    const slider = this.refs[SLIDER_REF]
    const rect = slider.getBoundingClientRect()
    const bounds = {min: rect.left, max: rect.right}

    if (! _.isEqual(bounds, this.state.bounds)) {
      this.setState({bounds})
    }

    return bounds
  }

  handleDragStart = (e) => {
    if (this.props.disabled) return

    const bounds = this.updateBounds()

    // State may not accurately reflect new bounds yet, so pass as param
    this.setValueFromPosition(e.clientX, bounds)

    document.addEventListener('mousemove', this.handleDragMove)
    document.addEventListener('mouseup', this.handleDragEnd)
    document.body.style.cursor = 'pointer'

    e.preventDefault()
    e.stopPropagation()
  }

  handleDragMove = (e) => {
    this.setValueFromPosition(e.clientX)

    e.preventDefault()
    e.stopPropagation()
  }

  handleDragEnd = (e) => {
    this.setValueFromPosition(e.clientX)

    document.removeEventListener('mousemove', this.handleDragMove)
    document.removeEventListener('mouseup', this.handleDragEnd)
    document.body.style.cursor = 'auto'

    e.preventDefault()
    e.stopPropagation()
  }

  setValueFromPosition(position, bounds = this.state.bounds) {
    this.props.onChange(this.calculateValueFromPosition(position, bounds))
  }

  calculateValueFromPosition(position, bounds) {
    const trackWidth = this.getTrackWidth(bounds)
    const {min, max, knobWidth} = this.props

    // Prevent division by 0
    if (trackWidth === 0) {
      return min
    }

    position = position - knobWidth / 2

    const percent = (position - bounds.min) / trackWidth
    const range = max - min
    const value = (percent * range) + min
    return Math.round(_.clamp(value, min, max))
  }

  getPercentValue() {
    const {min, max, value} = this.props
    const range = max - min

    // Prevent division by 0
    if (range === 0) return 0

    const percent = (value - min) / range
    return _.clamp(percent, 0, 1)
  }

  getTrackWidth(bounds = this.state.bounds) {
    const {knobWidth} = this.props
    const trackWidth = bounds.max - bounds.min

    return trackWidth - knobWidth
  }

  render() {
    const {styles} = this.props
    const knobDistance = this.getTrackWidth() * this.getPercentValue()

    return (
      <div
        ref={SLIDER_REF}
        style={styles.main}
        onMouseDown={this.handleDragStart}
      >
        <div style={styles.trackContainer}>
          <div style={styles.track}>
            <div style={{...styles.trackActive, width: knobDistance}} />
          </div>
        </div>
        <div style={styles.knobContainer}>
          <div style={{...styles.knob, left: knobDistance}} />
        </div>
      </div>
    )
  }
}
