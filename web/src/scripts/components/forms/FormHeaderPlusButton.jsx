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

import SimpleButton from '../buttons/SimpleButton'

const styles = {
  button: {
    position: 'relative',
    top: -2,
    fontSize: 16,
    fontWeight: 300,
    cursor: 'default',
    marginLeft: 8,
  },
  default: {
    opacity: 1,
  },
  hover: {
    opacity: 0.7,
  },
  active: {
    opacity: 0.85,
  }
}

export default class extends Component {
  render() {
    return (
      <SimpleButton
        defaultStyle={styles.default}
        activeStyle={styles.active}
        hoverStyle={styles.hover}
        innerStyle={styles.button}
        {...this.props}
      >
        +
      </SimpleButton>
    )
  }
}
