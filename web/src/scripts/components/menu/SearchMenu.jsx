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

const styles = {
  inner: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 380,
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  menu: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 3,
  },
}

class SearchMenu extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    const {show, requestClose, anchorPosition, ItemComponent, items, onItemClick} = this.props

    return (
      <DropdownMenu
        show={show}
        requestClose={requestClose}
        anchorPosition={anchorPosition}
        style={styles.menu}
        hideOnClick={true}
        captureBackground={true}
      >
        <div style={{...styles.inner, width: anchorPosition.width}}>
          <FilterableList
            ItemComponent={ItemComponent}
            items={items}
            onItemClick={onItemClick}
            autoSelectFirst={true}
            hideMenu={requestClose}
            transparentBackground={true}
          />
        </div>
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
