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
import React, { Component } from 'react'

import FormRow from '../forms/FormRow'
import Menu from '../menu/Menu'
import FormHeaderPlusButton from '../forms/FormHeaderPlusButton'

const INPUT_WIDTH = 115

const styles = {
  removeProperty: {
    position: 'relative',
    cursor: 'default',
    marginLeft: 9,
    width: 9,
    height: 12,
    WebkitMaskSize: '9px 12px',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskImage: `-webkit-image-set(` +
      `url('./icons/icon-trash-small.png') 1x, ` +
      `url('./icons/icon-trash-small@2x.png') 2x` +
    `)`,
    backgroundColor: 'rgb(180,180,180)',
  },
  inputContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
  },
  inputElement: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
  },
}

export default class extends Component {

  static propTypes = {
    inset: React.PropTypes.number,
    width: React.PropTypes.number,
    inputElement: React.PropTypes.any,
    menuElement: React.PropTypes.element.isRequired,
    deletable: React.PropTypes.bool,
  }

  static defaultProps = {
    inset: 0,
    deletable: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      hover: false,
      showMenu: false,
      menuPosition: { x: 0, y: 0 },
    }

    this.setMenuVisibility = this.setMenuVisibility.bind(this)
    this.setMenuVisibility = _.throttle(this.setMenuVisibility, 100, {
      leading: true,
      trailing: false,
    })
  }

  setMenuVisibility(visible) {
    this.setState({
      showMenu: visible
    })
  }

  render() {
    const {name, inset, width, inputElement, menuElement, deletable, onDelete, addable, onAdd} = this.props
    const {showMenu, caretOffset, menuPosition, hover} = this.state

    return (
      <FormRow
        label={name}
        statefulLabel={true}
        labelEnabled={showMenu}
        labelWidth={width - INPUT_WIDTH}
        inset={inset}
        inputWidth={INPUT_WIDTH}
        onLabelChange={() => this.setMenuVisibility(! showMenu)}
        onLabelPositionChange={({x, y, width}) => {
          this.setState({
            menuPosition: { x: x - width / 2, y },
            caretOffset: { x: Math.max(width / 2, 5), y: 0 },
          })
        }}
      >
        <div style={styles.inputElement}>
          {inputElement}
        </div>
        {addable && (
          <FormHeaderPlusButton onClick={onAdd} />
        )}
        {deletable && (
          <div style={styles.removeProperty} onClick={onDelete} />
        )}
        <Menu show={showMenu}
          caret={true}
          caretOffset={caretOffset}
          requestClose={this.setMenuVisibility.bind(null, false)}
          anchorPosition={menuPosition}>
          {showMenu && React.cloneElement(menuElement, {
            requestClose: this.setMenuVisibility.bind(null, false),
          })}
        </Menu>
      </FormRow>
    )
  }
}
