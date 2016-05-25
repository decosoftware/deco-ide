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
import { HotKeys } from 'react-hotkeys'

import MenuItem from './MenuItem'
import FilterableInputList from './FilterableInputList'

class FilterableList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchText: '',
      activeIndex: this.props.autoSelectFirst ? 0 : -1,
      filteredListItems: props.items,
      lastMoveTime: Date.now(),
    }
    this.keyMap = {
      moveUp: 'up',
      moveDown: 'down',
      select: 'enter',
      escape: 'escape'
    }

    this.keyHandlers = {
      moveUp: (e) => {
        e.preventDefault()
        if (this.state.activeIndex > 0) {
          this.setState({
            activeIndex: this.state.activeIndex - 1,
            lastMoveTime: Date.now(),
          })
        }
      },
      moveDown: (e) => {
        e.preventDefault();
        const length = this.state.filteredListItems.length
        if (this.state.activeIndex < length - 1) {
          this.setState({
            activeIndex: this.state.activeIndex + 1,
            lastMoveTime: Date.now(),
          })
        }
      },
      select: (e) => {
        this.props.hideMenu(false)
        const pkg = this.state.filteredListItems[this.state.activeIndex]
        if (!pkg) {
          return //empty enter
        }
        e.stopPropagation()
        e.preventDefault()
        if (pkg.onClick) {
          pkg.onClick()
        } else {
          this.props.onItemClick(pkg)
        }
      },
      escape: (e) => {
        this.props.hideMenu(false)
        e.stopPropagation()
        e.preventDefault()
      }
    }
  }

  componentDidUpdate() {
    const activeIndex = this.state.activeIndex

    if (this.refs[activeIndex]) {
      React.findDOMNode(this.refs[activeIndex]).scrollIntoViewIfNeeded(false)
    }
  }

  //TODO: move this somewhere else and make it more legit
  _filterList(list, searchText) {
    const filteredList = _.filter(list, (pkg) => {
      const escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      const regExpPattern = "\\b" + escapedSearchText
      return pkg.name.match(new RegExp(regExpPattern, 'gi'))
    })

    return _.orderBy(filteredList, [
      (pkg) => {
        if (pkg.name) {
          return pkg.name.toLowerCase()
        }
      },
      (pkg) => {
        if (pkg.official) {
          return true
        }
      }
    ], ['asc', 'asc'])
  }

  _onSearchTextChange(searchText) {
    let filteredListItems = searchText ? this._filterList(this.props.items, searchText) : []
    let newIndex = 0
    if (!searchText || searchText == '') {
      filteredListItems = this.props.items
      if (! this.props.autoSelectFirst) {
        // No selection
        newIndex = -1
      }
    }

    this.setState({
      searchText: searchText,
      activeIndex: newIndex,
      filteredListItems: filteredListItems,
    })
  }

  _onItemMouseOver(i) {
    if (Date.now() - this.state.lastMoveTime > 200) {
      this.setState({
        activeIndex: i,
      })
    }
  }

  _renderListItems() {
    const list = !this.state.searchText ? this.props.items : this.state.filteredListItems
    const renderedListItems = _.map(list, (item, i) => {
      return React.cloneElement(this.props.renderItem(item, i), {
        key: item.name,
        ref: i,
        onClick: this.props.onItemClick.bind(this, item),
        onMouseOver: this._onItemMouseOver.bind(this, i),
        width: this.props.width,
        active: i === this.state.activeIndex,
      })
    })
    if (renderedListItems.length === 0) {
      renderedListItems.push(
        <MenuItem key={'nomatches'} name={'No matches'}/>
      )
    }
    return renderedListItems
  }

  render() {
    const style = {
      outline: 'none'
    }

    return (
      <HotKeys keyMap={this.keyMap} handlers={this.keyHandlers} style={style}>
        <div className={this.props.className} style={this.props.style}>
          <FilterableInputList
            searchText={this.state.searchText}
            handleSearchTextChange={this._onSearchTextChange.bind(this)}/>
          <div className={'scrollbar-theme-light'}
            style={this.props.innerStyle}>
            {this._renderListItems()}
          </div>
        </div>
      </HotKeys>
    )
  }
}

FilterableList.defaultProps = {
  className: '',
  style: {},
  items: [],
  hideMenu: () => {},
}

export default FilterableList
