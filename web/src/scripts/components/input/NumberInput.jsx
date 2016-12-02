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
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

import { getLockedValue } from '../../utils/NumberUtils'

const stylesCreator = ({input}, {type, width, disabled}) => ({
  input: {
    ...(type === 'platform' ? input.platform : input.regular),
    display: 'flex',
    flex: width ? `0 0 ${width}px` : '1 0 0px',
    width: width ? width : 0,
    opacity: disabled ? 0.4 : 1,
  },
})

@StylesEnhancer(stylesCreator, ({type, width, disabled}) => ({type, width, disabled}))
@pureRender
export default class NumberInput extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    value: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    style: {},
    disabled: false,
    onSubmit: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      internalValue: props.value,
      valueIsStale: false,
      selection: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.valueIsStale) {
      return this.setState({
        internalValue: nextProps.value
      })
    }
  }

  roundInput(value) {
    return Math.round(value * 10) / 10
  }

  onInputChange = (e) => {
    const input = parseFloat(e.target.value)

    if (!_.isNaN(input)) {
      this.props.onChange(this.roundInput(input))
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

  onKeyDown = (e) => {
    const {step, max, min} = this.props
    let stopPropagation = false
    let incrementBy = 0

    switch (e.keyCode) {
      // Tab
      case 9:
        ;
      break
      // Enter
      case 13:
        stopPropagation = true
        this.props.onSubmit(e.target.value)
      break
      // Up arrow
      case 38:
        incrementBy = step || 1
        stopPropagation = true
      break
      // Down arrow
      case 40:
        incrementBy = step ? step * -1 : -1
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

    value = this.roundInput(value)
    value = getLockedValue(value, min, max, step)

    this.props.onChange(value)

    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  onBlur = () => {
    this.setState({
      selection: null,
      internalValue: this.props.value,
    })
  }

  componentDidUpdate() {
    const {selection} = this.state

    if (selection) {
      const inputElement = ReactDOM.findDOMNode(this.refs.input)
      const {start, end} = selection

      inputElement.setSelectionRange(start, end)
    }
  }

  render() {
    const {styles, disabled} = this.props

    return (
      <input
        ref={"input"}
        type={"text"}
        style={styles.input}
        disabled={disabled}
        value={this.state.internalValue}
        onChange={this.onInputChange}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
      />
    )
  }
}
