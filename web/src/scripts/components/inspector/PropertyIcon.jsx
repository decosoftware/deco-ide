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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const OMIT_PROPS = ['styles', 'width', 'height', 'icon']

const stylesCreator = ({colors, fonts}, {width, height, icon}) => ({
  icon: {
    position: 'relative',
    cursor: 'default',
    width: width,
    height: height,
    WebkitMaskSize: `${width}px ${height}px`,
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskImage: `-webkit-image-set(` +
      `url('./icons/${icon}.png') 1x, ` +
      `url('./icons/${icon}@2x.png') 2x` +
    `)`,
    backgroundColor: 'rgb(180,180,180)',
  },
})

@StylesEnhancer(stylesCreator, ({width, height, icon}) => ({width, height, icon}))
@pureRender
export default class extends Component {
  render() {
    const {styles} = this.props

    const props = _.omitBy(this.props, (v, k) => OMIT_PROPS.includes(k))

    return (
      <div style={styles.icon} {...props} />
    )
  }
}
