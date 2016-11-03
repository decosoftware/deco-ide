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

export const STOPLIGHT_BUTTONS_WIDTH = 78

const stylesCreator = (theme, {height}) => ({
  container: {
    WebkitAppRegion: 'drag',
    height,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: 'linear-gradient(rgb(245,244,245), rgb(210,208,210))',
    borderBottom: '1px solid rgb(195,195,195)',
    paddingLeft: STOPLIGHT_BUTTONS_WIDTH,
    paddingRight: 7,
  },
})

@StylesEnhancer(stylesCreator, ({height}) => ({height}))
@pureRender
export default class Toolbar extends React.Component {

  static defaultProps = {
    height: 40,
  }

  render() {
    const {styles, children, height} = this.props

    return (
      <div style={styles.container}>
        {children}
      </div>
    )
  }
}
