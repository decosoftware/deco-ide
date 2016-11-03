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

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import InputClearButton from '../buttons/InputClearButton'
import { StylesEnhancer } from 'react-styles-provider'
import StyleNode from '../../utils/StyleNode'

const styleNodes = {
  regular: new StyleNode().attach(),
  transparent: new StyleNode().attach(),
}

const getClassName = (transparentBackground) => {
  return `filter-input${transparentBackground ? '-transparent' : ''}`
}

const stylesCreator = ({colors}, transparentBackground) => {

  const styleNode = transparentBackground ? styleNodes.transparent : styleNodes.regular
  styleNode.setText(`
    .${getClassName(transparentBackground)}::-webkit-input-placeholder {
      color: ${transparentBackground ? colors.textSubtle : colors.textVerySubtle};
    }
  `)

  return {
    main: {
      position: 'relative',
      borderStyle: 'solid',
      borderWidth: 0,
      borderColor: transparentBackground ? colors.dividerVibrant : colors.dividerInverted,
      borderBottomWidth: 1,
    },
    input: {
      width: '100%',
      height: 45,
      lineHeight: '45px',
      paddingLeft: 15,
      paddingRight: 15,
      outline: 'none',
      fontSize: 13,
      letterSpacing: 0.3,
      border: 'none',
      color: colors.text,
      backgroundColor: transparentBackground ? 'transparent' : colors.input.background,
      boxSizing: 'border-box',
    }
  }
}

const selectProps = ({transparentBackground}) => transparentBackground

@StylesEnhancer(stylesCreator, selectProps)
export default class extends Component {

  componentDidMount() {
    const {autoFocus} = this.props

    if (autoFocus) {
      this.refs.filterInput.focus()
    }
  }

  handleClick = (e) => e.stopPropagation()

  handleChange = (e) => this.props.handleSearchTextChange(e.target.value)

  handleClearClick = (e) => {
    e.stopPropagation()
    this.props.handleSearchTextChange('')
    this.refs.filterInput.focus()
  }

  render() {
    const {styles, searchText, transparentBackground} = this.props
    const className = getClassName(transparentBackground)

    return (
      <div style={styles.main}>
        <input
          className={className}
          type={'search'}
          ref={'filterInput'}
          style={styles.input}
          placeholder={'Filter Components'}
          value={searchText}
          onClick={this.handleClick}
          onChange={this.handleChange}
        />
        {searchText && (
          <InputClearButton
            onClick={this.handleClearClick}
          />
        )}
      </div>
    )
  }
}
