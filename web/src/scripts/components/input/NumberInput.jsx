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
import ReactDOM from 'react-dom'

import { STYLES } from '../../constants/InputConstants'

const baseStyle = Object.assign({}, STYLES.INPUT, {
  display: 'flex',
  flex: '1 0 0px',
})

class NumberInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      internalValue: props.value,
      valueIsStale: false,
      selection: null
    }

    this._onBlur = this._onBlur.bind(this)
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onInputChange = this._onInputChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.valueIsStale) {
      return this.setState({
        internalValue: nextProps.value
      })
    }
  }

  _roundInput(value) {
    return Math.round(value * 10) / 10
  }

  _onInputChange(e) {
    const input = parseFloat(e.target.value)

    if (!_.isNaN(input)) {
      this.props.onChange(this._roundInput(input))
      return this.setState({
        internalValue: input,
        valueIsStale: false
      })
    } else {
      return this.setState({
        internalValue: e.target.value,
        valueIsStale: true
      })
    }
  }

  _onKeyDown(e) {
    let stopPropagation = false
    let incrementBy = 0

    switch (e.keyCode) {
      case 9:
        ;
      break
      case 13:
        stopPropagation = true
        this.props.onSubmit(e.target.value)
      break
      case 38:
        incrementBy = 1
        stopPropagation = true
      break
      case 40:
        incrementBy = -1
        stopPropagation = true
      break
      default:
        this.setState({
          selection: null
        })
        return
      break
    }

    if (e.shiftKey) {
      incrementBy *= 10
    } else if (e.altKey) {
      incrementBy *= 0.1
    }

    let inputElement = ReactDOM.findDOMNode(this.refs.input)

    this.setState({
      selection: {
        start: 0,
        end: e.target.value.length
      }
    })

    let value = parseFloat(e.target.value) + incrementBy

    if (this.state.valueIsStale) {
      value = this.props.value + incrementBy
      this.setState({
        valueIsStale: false,
        internalValue: value
      })
    }

    value = this._roundInput(value)

    this.props.onChange(value)

    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  _onBlur() {
    this.setState({
      selection: null,
      internalValue: this.props.value,
    })
  }

  componentDidUpdate() {
    if (this.state.selection) {
      const inputElement = ReactDOM.findDOMNode(this.refs.input)
      const {start, end} = this.state.selection
      inputElement.setSelectionRange(start, end)
    }
  }

  render() {
    let style = baseStyle
    let width = this.props.width
    if (width) {
      style = Object.assign({}, style, {
        width: width,
        flex: `0 0 ${width}px`,
      })
    }
    if (this.props.disabled) {
      style = Object.assign({}, style, {
        background: 'rgb(250,250,250)',
        color: 'rgb(154,154,154)',
      })
    }

    return (
      <input ref="input"
        type="text"
        style={style}
        disabled={this.props.disabled}
        value={this.state.internalValue}
        onChange={this._onInputChange}
        onKeyDown={this._onKeyDown}
        onBlur={this._onBlur} />
    )
  }

}

NumberInput.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func,
  value: React.PropTypes.number.isRequired,
  disabled: React.PropTypes.bool,
}

NumberInput.defaultProps = {
  className: '',
  style: {},
  disabled: false,
  onSubmit: () => {},
}

export default NumberInput
