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

import React, { Component, PropTypes, } from 'react'
import ReactDOM from 'react-dom'

import DropdownMenu from '../menu/DropdownMenu'

class DropdownMenuButton extends Component {

  static defaultProps = {
    style: {},
    className: '',
    offset: {
      x: 0,
      y: 0,
    },
    renderContent: () => <div />,
    onVisibilityChange: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      showMenu: false,
      menuPosition: {
        x: 0,
        y: 0,
      }
    }

    this.setMenuVisibility = this.setMenuVisibility.bind(this)
    this.setMenuVisibility = _.throttle(this.setMenuVisibility, 100, {
      leading: true,
      trailing: false
    })
  }

  componentDidMount() {
    const {x, y} = this.calculatePosition()

    this.setState({
      menuPosition: {x, y}
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const {x, y} = this.calculatePosition()
    const {onVisibilityChange} = this.props
    const {menuPosition, showMenu} = this.state

    if (x !== menuPosition.x || y !== menuPosition.y) {
      this.setState({
        menuPosition: {x, y}
      })
    }

    if (prevState.showMenu !== showMenu) {
      onVisibilityChange(showMenu)
    }
  }

  calculatePosition() {
    const node = ReactDOM.findDOMNode(this.refs.root)
    const {left, right, width, height, bottom} = node.getBoundingClientRect()

    return {
      y: bottom,
      x: (right + left) / 2,
      width: width,
      height: height,
    }
  }

  setMenuVisibility(visible) {
    this.setState({
      showMenu: visible
    })
  }

  render() {
    const {
      style,
      className,
      children,
      renderContent,
      offset,
    } = this.props

    const {
      showMenu,
      menuPosition,
      caretOffset,
    } = this.state

    return (
      <div
        ref={'root'}
        className={className}
        style={style}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()

          this.setMenuVisibility(! showMenu)
        }}>
        {children}
        <DropdownMenu show={showMenu}
          caret={true}
          positionX={'center'}
          hideOnClick={true}
          requestClose={this.setMenuVisibility.bind(null, false)}
          anchorPosition={{
            x: menuPosition.x + offset.x,
            y: menuPosition.y + offset.y,
          }}>
          {showMenu && renderContent()}
        </DropdownMenu>
      </div>
    )
  }
}

export default DropdownMenuButton
