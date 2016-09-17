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

const stylesCreator = ({input}, {type, width}) => ({
  input: {
    ...(type === 'platform' ? input.platform : input.regular),
    display: 'flex',
    flex: '1 0 0px',
    width: width ? width : 0,
  },
})

@StylesEnhancer(stylesCreator, ({type, width}) => ({type, width}))
@pureRender
export default class StringInput extends Component {

  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func,
    value: React.PropTypes.string.isRequired,
    placeholder: React.PropTypes.string,
    width: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
  }

  static defaultProps = {
    className: '',
    style: {},
    onSubmit: () => {},
  }

  state = {}

  onInputChange = (e) => this.props.onChange(e.target.value)

  onBlur = () => this.setState({selection: null})

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
    const {styles, value, placeholder, width} = this.props

    return (
      <input
        ref={"input"}
        type={"text"}
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={this.onInputChange}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
      />
    )
  }
}
