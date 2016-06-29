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

import PaneHeader from '../headers/PaneHeader'

const styles = {
  container: {
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
    minWidth: 0,
    flex: '1 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  }
}

export default class extends Component {

  render() {
    const {children, title} = this.props

    return (
      <div style={styles.container}>
        <PaneHeader
          text={title}
        />
        <div style={styles.inner}>
          {children}
        </div>
      </div>
    )
  }
}
