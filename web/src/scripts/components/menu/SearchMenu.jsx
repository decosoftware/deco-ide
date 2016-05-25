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

import React, { Component, PropTypes } from 'react'

import DropdownMenu from './DropdownMenu'
import FilterableList from './FilterableList'

class SearchMenu extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <DropdownMenu show={this.props.show}
        requestClose={this.props.requestClose}
        anchorPosition={this.props.anchorPosition}
        style={{padding: 0, overflow: 'hidden'}}
        hideOnClick={true}>
        <FilterableList
          items={this.props.items}
          onItemClick={this.props.onItemClick}
          renderItem={this.props.renderItem}
          autoSelectFirst={true}
          width={this.props.anchorPosition.width}
          innerStyle={{
            overflowY: 'auto',
            maxHeight: 380,
            width: this.props.anchorPosition.width,
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
          }} />
      </DropdownMenu>
    )
  }
}

SearchMenu.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorPosition: PropTypes.object.isRequired,
  requestClose: PropTypes.func,
  renderItem: PropTypes.func,
}

SearchMenu.defaultProps = {
  autoSelectFirst: true,
  items: [],
  onItemClick: () => {},
  requestClose: () => {},
}

export default SearchMenu
