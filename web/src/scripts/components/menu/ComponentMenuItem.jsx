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
import React, { Component, PropTypes } from 'react'
import pureRender from 'pure-render-decorator'

import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors}, {thumbnail, transparentBackground}) => {
  let styles = {
    row: {
      normal: {
        height: 45,
        cursor: 'default',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        minWidth: 0,
        minHeight: 0,
        paddingLeft: 15,
      },
    },
    content: {
      normal: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minWidth: 0,
        minHeight: 0,
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: transparentBackground ? colors.dividerVibrant : colors.dividerSubtle,
        borderBottomWidth: 1,
        paddingRight: 15,
      },
    },
    name: {
      normal: {
        flex: 1,
        color: colors.textSubtle,
        fontSize: 13,
        fontWeight: 400,
        letterSpacing: 0.3,
      }
    },
    badge: {
      normal: {
        color: '#aaa',
        backgroundColor: 'rgba(170,170,170,0.1)',
        display: 'inline-block',
        fontSize: '9px',
        lineHeight: '14px',
        padding: '1px 8px 0px 8px',
        borderRadius: '20px',
        textTransform: 'uppercase',
      },
    },
    badgeContainer: {
      flex: '0 0 auto',
      overflow: 'hidden',
      whiteSpace: 'normal',
      lineHeight: '0px',
    },
    thumbnail: {
      width: 36,
      height: 36,
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundColor: 'rgba(170,170,170,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(170,170,170,0.2)',
      borderStyle: 'solid',
      marginRight: 8,
    },
  }

  styles = {
    ...styles,
    row: {
      ...styles.row,
      active: {
        ...styles.row.normal,
        backgroundColor: '#4A90E2',
        color: 'white',
        boxShadow: '0 0 0 1px #4A90E2',
      },
    },
    name: {
      ...styles.name,
      active: {
        ...styles.name.normal,
        color: 'white',
      },
    },
    content: {
      ...styles.content,
      active: {
        ...styles.content.normal,
        borderBottomWidth: 0,
      },
    },
    badge: {
      ...styles.badge,
      active: {
        ...styles.badge.normal,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
      },
    },
  }

  return styles
}

const selectProps = ({thumbnail, transparentBackground}) => ({thumbnail, transparentBackground})

@StylesEnhancer(stylesCreator, selectProps)
@pureRender
export default class extends Component {

  static defaultProps = {
    onClick: () => {},
    onDoubleClick: () => {},
    onMouseEnter: () => {},
    onContextMenu: () => {},
    name: '',
    tags: [],
    active: false,
  }

  onClick = () => this.props.onClick(this.props.item)

  onDoubleClick = () => this.props.onDoubleClick(this.props.item)

  onMouseEnter = () => this.props.onMouseEnter(this.props.item)

  onContextMenu = () => this.props.onContextMenu(this.props.item)

  render() {
    const {styles, name, tags, active} = this.props
    const selector = active ? 'active' : 'normal'

    return (
      <div
        style={styles.row[selector]}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        onMouseEnter={this.onMouseEnter}
        onContextMenu={this.onContextMenu}
      >
        <div style={styles.content[selector]}>
          <div style={styles.thumbnail} />
          <span style={styles.name[selector]}>
            {name}
          </span>
          <div style={styles.badgeContainer}>
            {_.map(tags.slice(0,1), (title) => {
              return (
                <span
                  style={styles.badge[selector]}
                  key={title}
                >
                  {title}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}
