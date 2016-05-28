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

const remote = Electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const iconStyle = {
  width: 11,
  height: 11,
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskImage: `-webkit-image-set(` +
    `url('./icons/icon-file.png') 1x, ` +
    `url('./icons/icon-file@2x.png') 2x` +
  `)`,
  backgroundColor: "#484848",
  marginRight: 6,
  position: 'relative',
  top: -1,
}

class FileNode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: this.props.style,
    }
    this._changeStyle = (toHover) => {
      let style = this.props.style
      if (toHover) {
        style = this.props.hoverStyle
      }
      this.setState({
        style: style,
      })
    }
    this._onShowInFinder = () => {
      this.props.onShowInFinder(this.props.node)
    }
    this._onRename = () => {
      this.props.onRename(this.props.node)
    }
    this._onDelete = () => {
      this.props.onDelete(this.props.node)
    }
    this._menu = new Menu()
    this._menu.append(new MenuItem({ label: 'Rename', click: this._onRename }))
    this._menu.append(new MenuItem({ label: 'Delete', click: this._onDelete }))
    this._menu.append(new MenuItem({ label: 'Show in Finder', click: this._onShowInFinder }))
  }

  _showContextMenu(e) {
    e.preventDefault()
    this._menu.popup(remote.getCurrentWindow())
  }

  render() {
    let style = this.state.style
    if (this.props.isSelected) {
      style = this.props.selectedStyle
    }
    if (this.props.isUnsaved) {
      style = Object.assign({}, style, this.props.unsavedStyle)
    }

    return (
      <span style={style}
        onClick={this.props.onClick}
        onDoubleClick={this.props.onDoubleClick}
        onContextMenu={this._showContextMenu.bind(this)}
        onMouseEnter={this._changeStyle.bind(this, true)}
        onMouseLeave={this._changeStyle.bind(this, false)}>
        <div style={iconStyle} />
        {this.props.children}
      </span>
    )
  }
}

const style = {
  display: 'inline-block',
  width: '100%',
  padding: '4px 5px',
}

FileNode.defaultProps = {
  style: style,
  hoverStyle: style,
  unsavedStyle: style,
  onClick: () => {},
  onDoubleClick: () => {},
  isUnsaved: false,
  onRename: () => {},
  onDelete: () => {},
}

export default FileNode
