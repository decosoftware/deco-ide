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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const stylesCreator = (theme, {style, height}) => ({
  container: {
    ...style,
    height,
    background: 'linear-gradient(rgb(238,237,238), rgb(231,230,231))',
    borderBottom: '1px solid rgb(224,224,226)',
    fontSize: 12,
    WebkitAppRegion: 'drag',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    WebkitAppRegion: 'drag',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  title: {
    WebkitAppRegion: 'drag',
    textAlign: 'center',
    height: 10,
    lineHeight: '14px',
    fontSize: 14,
    color: 'rgb(58, 58, 58)',
    paddingTop: 4,
  },
})

@StylesEnhancer(stylesCreator, ({style, height}) => ({style, height}))
@pureRender
export default class Toolbar extends React.Component {

  static defaultProps = {
    height: 60,
    title: '',
  }

  render() {
    const {styles, children, title, height} = this.props

    return (
      <div
        className={'helvetica-smooth'}
        style={styles.container}
      >
        {title && (
          <div style={styles.title}>
            {title}
          </div>
        )}
        <div style={styles.content}>
          {children}
        </div>
      </div>
    )
  }
}
