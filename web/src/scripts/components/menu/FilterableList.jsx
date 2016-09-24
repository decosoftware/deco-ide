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
import { AutoSizer, VirtualScroll } from 'react-virtualized'

import ComponentMenuItem from './ComponentMenuItem'
import FilterableInputList from './FilterableInputList'

const styles = {
  main: {
    outline: 'none',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
  },
  autoSizerWrapper: {
    flex: '1 1 auto',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
}

export default class FilterableList extends Component {

  static defaultProps = {
    items: [],
    hideMenu: () => {},
    onClickItem: () => {},
    onSelectItem: () => {},
  }

  constructor(props) {
    super()

    this.state = {
      searchText: '',
      activeIndex: props.autoSelectFirst ? 0 : -1,
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
        const {activeIndex} = this.state
        if (activeIndex > 0) {
          const newIndex = activeIndex - 1
          this.setState({
            activeIndex: newIndex,
            lastMoveTime: Date.now(),
          })
          this._handleSelectItem(newIndex)
        }
      },
      moveDown: (e) => {
        e.preventDefault()
        const {items} = this.props
        const {searchText, filteredListItems, activeIndex} = this.state
        const list = searchText ? filteredListItems : items
        const length = list.length
        const isBeforeList = activeIndex === -1 && length > 0

        if (isBeforeList || activeIndex < length - 1) {
          const newIndex = activeIndex + 1
          this.setState({
            activeIndex: newIndex,
            lastMoveTime: Date.now(),
          })
          this._handleSelectItem(newIndex)
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
          this.props.onClickItem(pkg)
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
  }

  //TODO: move this somewhere else and make it more legit
  _filterList(list, searchText) {
    const filteredList = _.filter(list, (pkg) => {
      const escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      const regExpPattern = "\\b" + escapedSearchText

      if (pkg.tags &&
          pkg.tags.length > 0 &&
          pkg.tags.indexOf(escapedSearchText) >= 0) {
        return true
      }

      const name = pkg.displayName || pkg.name
      return name.match(new RegExp(regExpPattern, 'gi'))
    })

    return _.orderBy(filteredList, [
      (pkg) => {
        const name = pkg.displayName || pkg.name
        if (name) {
          return name.toLowerCase()
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
    this._handleSelectItem(newIndex, searchText, filteredListItems)
  }

  _onItemMouseEnter(i) {
    if (Date.now() - this.state.lastMoveTime > 200) {
      this.setState({
        activeIndex: i,
      })
      this._handleSelectItem(i)
    }
  }

  _handleSelectItem(index, searchText, filteredListItems) {
    searchText = searchText || this.state.searchText
    filteredListItems = filteredListItems || this.state.filteredListItems

    const {onSelectItem, items} = this.props
    const list = searchText ? filteredListItems : items

    onSelectItem(list[index])
  }

  handleMouseLeave = () => {
    this.setState({
      activeIndex: -1,
    })
    this._handleSelectItem(-1)
  }

  renderItem = ({index}) => {
    const {items, onClickItem, ItemComponent, transparentBackground} = this.props
    const {searchText, filteredListItems, activeIndex} = this.state
    const list = searchText ? filteredListItems : items

    if (list.length === 0) {
      return (
        <ItemComponent
          key={'nomatches'}
          name={'No Matches'}
          transparentBackground={transparentBackground}
        />
      )
    }

    const item = list[index]
    const {name, displayName, tags} = item

    return (
      <ItemComponent
        key={item.id}
        ref={index}
        onClick={onClickItem}
        onMouseEnter={this._onItemMouseEnter.bind(this, index)}
        active={index === activeIndex}
        name={displayName || name}
        tags={tags}
        item={item}
        transparentBackground={transparentBackground}
      />
    )
  }

  render() {
    const {keyMap, keyHandlers, _onSearchTextChange} = this
    const {items, onClickItem, ItemComponent, autoFocus, transparentBackground} = this.props
    const {searchText, filteredListItems, activeIndex} = this.state
    const list = searchText ? filteredListItems : items

    return (
      <HotKeys
        keyMap={keyMap}
        handlers={keyHandlers}
        style={styles.main}
      >
        <FilterableInputList
          autoFocus={autoFocus}
          searchText={searchText}
          handleSearchTextChange={_onSearchTextChange.bind(this)}
          transparentBackground={transparentBackground}
        />
        <div
          style={styles.autoSizerWrapper}
          onMouseLeave={this.handleMouseLeave}
        >
          <AutoSizer>
            {({width, height}) => (
              <VirtualScroll
                height={height}
                overscanRowCount={3}
                rowHeight={45}
                rowRenderer={this.renderItem}
                rowCount={list.length || 1}
                width={width}
                scrollToIndex={activeIndex}
                // Force update
                activeIndex={activeIndex}
                hasContent={list.length > 0}
              />
            )}
          </AutoSizer>
        </div>
      </HotKeys>
    )
  }
}
