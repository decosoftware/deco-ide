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
import ThemeEnhancer from '../../themes/Enhancer'

const stylesCreator = ({colors}) => {
  return {
    main: {
      position: 'relative',
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
      borderStyle: 'solid',
      borderWidth: 0,
      borderColor: colors.divider,
      // borderTopWidth: 1,
      borderBottomWidth: 1,
      // backgroundColor: '#F6F6F6',
      backgroundColor: colors.background,
      boxSizing: 'border-box',
    }
  }
}

@ThemeEnhancer(stylesCreator)
class FilterableInputList extends Component {

  handleClick(e) {
    e.stopPropagation()
  }

  handleChange(e) {
    this.props.handleSearchTextChange(e.target.value)
  }

  handleClearClick(e) {
    e.stopPropagation()
    this.props.handleSearchTextChange('')
    ReactDOM.findDOMNode(this.refs.filterInput).focus()
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.filterInput).focus()
  }

  _renderClearButton() {
    if (this.props.searchText) {
      return (
        <InputClearButton onClick={this.handleClearClick.bind(this)}/>
      )
    }
    return null
  }

  render() {
    const {styles} = this.props

    return (
      <div
        style={styles.main}>
        <input type={'search'}
          ref={'filterInput'}
          style={styles.input}
          placeholder={'Search Components'}
          value={this.props.searchText}
          onClick={this.handleClick.bind(this)}
          onChange={this.handleChange.bind(this)}/>
        {this._renderClearButton()}
      </div>
    )
  }

}

FilterableInputList.defaultProps = {
  className: '',
  style: {},
}

export default FilterableInputList
