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

const INPUT_WIDTH = 115

export default class extends Component {

  static propTypes = {
    inset: React.PropTypes.number,
    width: React.PropTypes.number,
    inputElement: React.PropTypes.any,
    menuElement: React.PropTypes.element.isRequired,
  }

  static defaultProps = {
    inset: 0,
  }

  constructor(props) {
    super(props)

    this.state = {
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
    const {name, inset, width, inputElement, menuElement} = this.props
    const {showMenu, caretOffset, menuPosition} = this.state

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
        {inputElement}
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
