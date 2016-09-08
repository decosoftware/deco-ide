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

const styles = {
  container: {
    backgroundColor: 'white',
    height: 32,
    width: '100%',
    lineHeight: '32px',
    textAlign: 'center',
    color: 'rgb(103,103,103)',
    fontSize: 12,
    fontWeight: 500,
    borderBottom: '1px solid rgb(224,224,224)',
    paddingLeft: 10,
    paddingRight: 10,
    cursor: 'default',
  },
  sideTitle: {
    position: 'absolute',
    color: '#198BFB',
  },
  rightTitle: {
    right: 10,
  },
  leftTitle: {
    left: 10,
  },
}

export default class extends Component {

  static propTypes = {}

  static defaultProps = {
    onClickLeftTitle: () => {},
    onClickRightTitle: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {text, leftTitle, rightTitle, onClickLeftTitle, onClickRightTitle} = this.props

    return (
      <div className={'helvetica-smooth'} style={styles.container}>
        <span
          style={{...styles.sideTitle, ...styles.leftTitle}}
          onClick={onClickLeftTitle}
        >
          {leftTitle}
        </span>
        {text}
        <span
          style={{...styles.sideTitle, ...styles.rightTitle}}
          onClick={onClickRightTitle}
        >
          {rightTitle}
        </span>
      </div>
    )
  }
}
