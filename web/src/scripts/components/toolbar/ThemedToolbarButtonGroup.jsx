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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const stylesCreator = () => ({
  container: {
    flex: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 0,
    height: '100%',
    position: 'relative',
  },
  dividerInner: {
    width: 1,
    height: 'calc(100% - 3px)',
    background: 'rgb(221,221,221)',
    position: 'relative',
    top: 1,
    zIndex: 1000,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class ThemedToolbarButtonGroup extends Component {

  getButtonPosition(i, childCount) {
    if (childCount === 1) {
      return 'none'
    }

    if (i === 0) {
      return 'left'
    } else if (i === childCount - 1) {
      return 'right'
    } else {
      return 'center'
    }
  }

  renderChildren() {
    const {children, styles} = this.props

    return React.Children
      .toArray(children)

      // Filter falsy children
      .filter(child => child)

      // Add groupPosition prop
      .map((child, i, list) => {
        return React.cloneElement(child, {
          key: i,
          groupPosition: this.getButtonPosition(i, list.length)
        })
      })

      // Add dividers inbetween buttons
      .reduce((acc, child, i, list) => {
        acc.push(child)

        if (i < list.length - 1) {
          acc.push(
            <div style={styles.divider} key={`s${i}`}>
              <div style={styles.dividerInner} />
            </div>
          )
        }

        return acc
      }, [])
  }

  render() {
    const {styles} = this.props

    return (
      <div style={styles.container}>
        {this.renderChildren()}
      </div>
    )
  }
}
