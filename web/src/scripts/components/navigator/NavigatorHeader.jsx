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
import PlusButtonWithDropdown from './PlusButtonWithDropdown'

const remote = Electron.remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const style = {
  display: 'flex',
  flexDirection: 'row',
  color: 'rgb(63,63,63)',
  fontSize: 11,
  letterSpacing: 0.3,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}

const iconStyle = {
  width: 11,
  height: 11,
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskImage: `-webkit-image-set(` +
    `url('./icons/icon-folder.png') 1x, ` +
    `url('./icons/icon-folder@2x.png') 2x` +
  `)`,
  backgroundColor: "#484848",
  marginRight: 6,
  position: 'relative',
  top: 6,
}

function conditionallyGiveMargin(children) {
  const style = {}
  if (children) {
    style.marginRight = 10
  }
  return (
    <div style={style}>
      {children}
    </div>
  )
}


class NavigatorHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this._onCreateSubFile = () => {
      this.props.onCreateSubFile(this.props.node)
    }
    this._onCreateSubDir = () => {
      this.props.onCreateSubDir(this.props.node)
    }
    this._onRename = () => {
      if (this.props.node.isProjectRoot) return
      this.props.onRename(this.props.node)
    }
    this._onDelete = () => {
      if (this.props.node.isProjectRoot) return
      this.props.onDelete(this.props.node)
    }
    this._onShowInFinder = () => {
      this.props.onShowInFinder(this.props.node)
    }
  }
  _showContextMenu(e) {
    e.preventDefault()
    
    if (! this._menu) {
      this._menu = new Menu()
      this._menu.append(new MenuItem({ label: 'New File', click: this._onCreateSubFile}))
      this._menu.append(new MenuItem({ label: 'New Directory', click: this._onCreateSubDir}))
      this._menu.append(new MenuItem({ type: 'separator' }))
      this._menu.append(new MenuItem({ label: 'Rename', click: this._onRename }))
      this._menu.append(new MenuItem({ label: 'Delete', click: this._onDelete }))
      this._menu.append(new MenuItem({ label: 'Show in Finder', click: this._onShowInFinder }))
    }

    this._menu.popup(remote.getCurrentWindow())
  }
  renderButton() {
    const {hover, menuVisible} = this.state
    const {node, scaffolds, onCreateSubFile, onCreateSubDir} = this.props

    if (! (menuVisible || hover)) {
      return null
    }

    return (
      <PlusButtonWithDropdown
        node={node}
        scaffolds={scaffolds}
        visible={menuVisible}
        onCreateSubFile={onCreateSubFile}
        onCreateSubDir={onCreateSubDir}
        onVisibilityChange={(menuVisible) => {
          this.setState({menuVisible})
        }}
      />
    )
  }
  render() {
    const {hover, menuVisible} = this.state

    return (
      <div style={style}
        onContextMenu={this._showContextMenu.bind(this)}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false})}>
        {conditionallyGiveMargin(this.props.children)}
        <div style={iconStyle} />
        <div className={'flex-variable'}>
          {this.props.listName}
        </div>
        {this.renderButton()}
      </div>
    )
  }
}

NavigatorHeader.defaultProps = {
  className: '',
  style: {},
  onCreateSubFile: () => {},
  onCreateSubDir: () => {},
  onRename: () => {},
  onDelete: () => {},
}

export default NavigatorHeader
