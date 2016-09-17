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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const stylesCreator = ({fonts}) => ({
  container: {
    flex: 0,
    flexDirection: 'column',
    display: 'flex',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    display: 'flex',
  },
  headerText: {
    ...fonts.regular,
  },
  field: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyField extends Component {

  static defaultProps = {
    title: '',
  }

  render() {
    const {styles, children, title} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerText}>
            {title.toUpperCase()}
          </div>
        </div>
        <div style={styles.field}>
          {children}
        </div>
      </div>
    )
  }
}
