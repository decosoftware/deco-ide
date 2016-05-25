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
import _ from 'lodash'

import DropdownMenu from './DropdownMenu'

export default class ContextContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      menuPosition: {
        x: 0,
        y: 0,
      }
    }
    this._onClick = _.throttle(() => {
      this.setState({
        show: false,
      })
    }, 200, {
      leading: true,
      trailing: false,
    })
  }

  _onContextMenu(e) {
    e.preventDefault()
    e.stopPropagation()

    if (this.props.onContextMenu) {
      this.props.onContextMenu(this.props.item)
    }
    this.setState({
      menuPosition: {
        x: e.clientX,
        y: e.clientY,
      },
    })
    this.setState({
      show: true,
    })
  }

  _visibilityChange(value) {
    this.setState({
      show: value,
    })
  }

  _injectChildren() {
    return (
      <div key={this.props.id} onClick={this._onClick.bind(this)} onContextMenu={this._onContextMenu.bind(this)}>
        {this.props.children}
        <DropdownMenu
          show={this.state.show}
          anchorPosition={this.state.menuPosition}
          hideOnClick={true}
          onVisibilityChange={this._visibilityChange.bind(this)}
          style={this.props.dropdownMenuStyle}>
          <div>
            {this.props.contextMenu}
          </div>
        </DropdownMenu>
      </div>
    )
  }
  render() {
    return React.cloneElement(this.props.element, {}, this._injectChildren())
  }
}
