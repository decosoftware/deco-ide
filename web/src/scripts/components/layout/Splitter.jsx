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
import React, { Component, PropTypes, } from 'react'
import WorkspaceEnhancer from 'react-workspace'
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = (theme, {width, height}) => ({
  container: {
    width,
    height,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  pane: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 100,
  },
  content: {
    flex: 1,
  },
})

@StylesEnhancer(stylesCreator, ({width, height}) => ({width, height}))
@WorkspaceEnhancer('splitter')
export default class Splitter extends Component {

  static propTypes = {}

  static defaultProps = {}

  render() {
    const {styles, children} = this.props

    const panes = React.Children.map(children, (child, i) => (
      <div key={i} style={styles.pane}>
        {React.cloneElement(child, {style: styles.content})}
      </div>
    ))

    return (
      <div
        style={styles.container}
        data-resizable
        data-resize-mode={'%'}
      >
        {panes}
      </div>
    )
  }
}
