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

import React, { Component, } from 'react'
import ReactDOM from 'react-dom'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const stylesCreator = ({input}, {type, width, disabled}) => ({
  input: {
    ...type === 'platform' ? input.platform : input.regular,
    ...type !== 'platform' && {outline: 'none'},
    display: 'flex',
    flex: '1 0 0px',
    width: width ? width : 0,
    opacity: disabled ? 0.4 : 1,
  },
})

@StylesEnhancer(stylesCreator, ({type, width, disabled}) => ({type, width, disabled}))
@pureRender
export default class StringInput extends Component {

  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    value: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    width: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    disabled: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    style: {},
    onSubmit: () => {},
    onFocus: () => {},
    onBlur: () => {},
    disabled: false,
    autoFocus: false,
  }

  state = {}

  componentDidMount() {
    const {autoFocus, value} = this.props
    const {input} = this.refs

    if (autoFocus) {
      if (value.length) {
        this.setState({
          selection: {start: 0, end: value.length},
        })
      }

      input.focus()
    }
  }

  onInputChange = (e) => this.props.onChange(e.target.value)

  onBlur = () => {
    const {onBlur} = this.props

    this.setState({selection: null})
    onBlur()
  }

  onKeyDown = (e) => {
    const {value} = e.target

    switch (e.keyCode) {
      case 9: // Tab
        ;
      break
      case 13: // Enter
        this.props.onSubmit(value)
        e.target.blur()

        this.setState({selection: null})

        e.preventDefault()
        e.stopPropagation()

        return
      break
      default:
        this.setState({selection: null})
        return
      break
    }

    this.setState({
      selection: {
        start: 0,
        end: value.length
      }
    })

    this.props.onChange(value)
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
    const {styles, value, placeholder, width, disabled, onFocus} = this.props

    return (
      <input
        ref={"input"}
        type={"text"}
        style={styles.input}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={this.onInputChange}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
        onFocus={onFocus}
      />
    )
  }
}
