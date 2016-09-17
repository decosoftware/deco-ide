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
import React, { Component, } from 'react'
import ReactDOM from 'react-dom'
import Colr from 'colr'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

import Menu from '../menu/Menu'
import ColorPicker from './ColorPicker'

const stylesCreator = ({colors}, {style, value}) => ({
  main: {
    width: 32,
    height: 21,
    padding: 3,
    display: 'inline-block',
    background: colors.colorInput.background,
    borderRadius: 2,
    boxShadow: `0 0 1px 0px ${colors.colorInput.shadow}`,
    cursor: 'pointer',
    ...style,
  },
  box: {
    height: 15,
    borderRadius: 2,
    position: 'relative',
  },
  checkers: {
    borderRadius: 3,
  },
  color: {
    background: value,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 2,
    boxShadow: `0 0 1px 1px ${colors.colorInput.shadowInner} inset`,
  },
})

@StylesEnhancer(stylesCreator, ({style, value}) => ({style, value}))
@pureRender
export default class ColorInput extends Component {

  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.string.isRequired,
  }

  static defaultProps = {
    className: '',
    style: {},
  }

  state = {
    showMenu: false,
    menuPosition: {top: 0, left: 0}
  }

  // Throttle toggling the menu to prevent the close even from triggering it open
  setMenuVisibility = _.throttle(
    (visible) => this.setState({showMenu: visible}),
    200,
    {leading: true, trailing: false}
  )

  requestClose = () => this.setMenuVisibility(false)

  onClickMenuButton = () => this.setMenuVisibility(! this.state.showMenu)

  onChange = (value) => this.props.onChange(value)

  calculatePosition() {
    const positionRect = ReactDOM.findDOMNode(this.refs.position).getBoundingClientRect()
    const position = {
      y: positionRect.bottom,
      x: (positionRect.left + positionRect.right) / 2
    }
    return position
  }

  componentDidUpdate(prevProps, prevState) {
    const position = this.calculatePosition()

    if (!_.isEqual(this.state.menuPosition, position)) {
      this.setState({menuPosition: position})
    }
  }

  render() {
    const {styles, value, onChange, onContextMenu} = this.props
    const {showMenu, menuPosition} = this.state

    return (
      <span
        ref={'position'}
        style={styles.main}
        onClick={this.onClickMenuButton}
        onContextMenu={onContextMenu}
      >
        <div style={styles.box}>
          <div style={styles.checkers} className={'transparency-checkers'} />
          <div style={styles.color} />
        </div>
        <Menu
          show={showMenu}
          caret={true}
          requestClose={this.requestClose}
          anchorPosition={menuPosition}
          captureBackground={true}
        >
          {showMenu && (
            <ColorPicker
              value={value}
              onChange={onChange}
            />
          )}
        </Menu>
      </span>
    )
  }

}
