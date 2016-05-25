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

let SLIDER_REF = 'slider'

class SliderInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bounds: {
        min: 0,
        max: 1,
      }
    }
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragMove = this.handleDragMove.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
  }
  componentDidMount() {
    this.updateBounds()
  }
  componentWillReceiveProps() {
    this.updateBounds()
  }
  updateBounds() {
    let slider = this.refs[SLIDER_REF]
    let rect = slider.getBoundingClientRect()
    let bounds = {
      min: rect.left,
      max: rect.right,
    }
    if (! _.isEqual(bounds, this.state.bounds)) {
      this.setState({bounds})
    }
    return bounds
  }
  handleDragStart(e) {
    if (this.props.disabled) {
      return
    }

    let bounds = this.updateBounds()
    // State may not accurately reflect new bounds yet, so pass as param
    this.setValueFromPosition(e.clientX, bounds)
    document.addEventListener('mousemove', this.handleDragMove)
    document.addEventListener('mouseup', this.handleDragEnd)
    document.body.style.cursor = 'pointer'
    e.preventDefault()
    e.stopPropagation()
  }
  handleDragMove(e) {
    this.setValueFromPosition(e.clientX)
    e.preventDefault()
    e.stopPropagation()
  }
  handleDragEnd(e) {
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
    let trackWidth = this.getTrackWidth(bounds)
    // Prevent division by 0
    if (trackWidth === 0) {
      return this.props.min
    }
    position = position - this.props.knobWidth / 2
    let percent = (position - bounds.min) / trackWidth
    let range = this.props.max - this.props.min
    let value = (percent * range) + this.props.min
    return Math.round(_.clamp(value, this.props.min, this.props.max))
  }
  getPercentValue() {
    let range = this.props.max - this.props.min
    // Prevent division by 0
    if (range === 0) {
      return 0
    }
    let percent = (this.props.value - this.props.min) / range
    return _.clamp(percent, 0, 1)
  }
  getTrackWidth(bounds = this.state.bounds) {
    let trackWidth = bounds.max - bounds.min
    return trackWidth - this.props.knobWidth
  }
  render() {
    let knobDistance = this.getTrackWidth() * this.getPercentValue()
    let style = {
      position: 'relative',
      display: 'inline-block',
      flex: `1 0 ${this.props.width}px`,
      height: 20,
    }
    if (this.props.disabled) {
      style = Object.assign({}, style, {
        opacity: 0.5,
      })
    }
    let trackStyle = {
      width: '100%',
      top: 8.5,
      height: 3,
      position: 'absolute',
      backgroundColor: 'rgb(179,179,179)',
      borderRadius: 3,
    }
    let knobStyle = {
      left: knobDistance,
      top: 4,
      width: this.props.knobWidth,
      height: this.props.knobWidth,
      borderRadius: '50%',
      backgroundColor: 'white',
      cursor: 'pointer',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
      position: 'absolute',
    }
    let trackActiveStyle = {
      width: `${knobDistance}`,
      height: '100%',
      background: 'rgb(54,159,249)',
    }
    if (this.props.disabled) {
      trackActiveStyle = Object.assign({}, trackActiveStyle, {
        background: 'rgb(140,140,140)',
      })
    }
    return (
      <div ref={SLIDER_REF}
        onMouseDown={this.handleDragStart}
        style={style}>
        <div style={trackStyle}>
          <div style={trackActiveStyle} />
        </div>
        <div style={knobStyle} />
      </div>
    )
  }
}

SliderInput.propTypes = {
  value: React.PropTypes.number,
  min: React.PropTypes.number,
  max: React.PropTypes.number,
  onChange: React.PropTypes.func,
  disabled: React.PropTypes.bool,
}

SliderInput.defaultProps = {
  value: 0,
  min: 0,
  max: 100,
  width: 80,
  knobWidth: 12,
  onChange: _.identity,
  disabled: false,
}

module.exports = SliderInput
