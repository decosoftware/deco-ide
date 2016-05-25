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

const baseStyle = {
  minWidth: 100,
  height: 98,
  lineHeight: '20px',
  fontSize: 12,
  padding: '8px 20px 0 20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'relative',
  backgroundColor: 'rgb(254,253,254)',
}

const alternateStyle = Object.assign({}, baseStyle, {
  backgroundColor: 'rgb(250,249,250)',
})

const activeStyle = Object.assign({}, baseStyle, {
  backgroundColor: '#4A90E2',
  color: 'white',
})

const baseBadgeStyle = {
  color: '#aaa',
  backgroundColor: "rgba(239,239,239,1)",
  display: 'inline-block',
  fontSize: '9px',
  lineHeight: '14px',
  padding: '1px 8px 0px 8px',
  borderRadius: '20px',
  marginRight: '6px',
  position: 'relative',
  top: '2px',
  textTransform: 'uppercase',
}

const activeBadgeStyle = Object.assign({}, baseBadgeStyle, {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#fff',
})

const badgeContainerStyle = {
  overflow: 'hidden',
  whiteSpace: 'normal',
  width: '100%',
  height: 22,
}

const baseAuthorStyle = {
  color: '#999',
  fontSize: 11,
  letterSpacing: 0.3,
}

const activeAuthorStyle = Object.assign({}, baseAuthorStyle, {
  color: '#DDD',
})

const dashStyle = {
  margin: '0 7px',
}

const baseDescriptionStyle = {
  whiteSpace: 'normal',
  color: 'rgb(73,73,73)',
  fontSize: 11,
  letterSpacing: 0.3,
  paddingTop: 4,
  lineHeight: '15px',
  height: 32,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'inline-block'
}

const activeDescriptionStyle = Object.assign({}, baseDescriptionStyle, {
  color: 'white',
})

const baseNameStyle = {
  color: 'rgb(73,73,73)',
  fontSize: 11,
  fontWeight: 'bold',
}

const activeNameStyle = Object.assign({}, baseNameStyle, {
  color: 'white',
})

class ComponentMenuItem extends Component {

  renderImage(width) {
    if (this.props.image) {
      const imageStyle = {
        width: '82px',
        height: '82px',
        backgroundImage: "url(" + this.props.image + ")",
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        left: "calc(" + width + " - 98px)",
        border: '1px solid #DDD',
        backgroundColor: 'white',
      }

      if (this.props.active) {
        Object.assign(imageStyle, {
          opacity: 0.8,
          border: '1px solid rgb(143,187,240)',
        })
      }

      return (
        <div className={'flex-fixed'} style={imageStyle} />
      )
    } else {
      return null
    }
  }

  renderAuthor() {
    if (this.props.author) {
      return (
        <span style={this.props.active ? activeAuthorStyle : baseAuthorStyle}>
          <span style={dashStyle}>–</span>
          {this.props.author}
        </span>
      )
    } else {
      return null
    }
  }

  renderBadges() {
    return (
      <div style={badgeContainerStyle}>
        {_.map(this.props.badges, (title) => {
          return (
            <span
              style={this.props.active ? activeBadgeStyle : baseBadgeStyle}
              key={title}>
              {title}
            </span>
          )
        })}
      </div>
    )
  }

  renderDescription() {
    if (this.props.description) {
      return (
        <span style={this.props.active ? activeDescriptionStyle : baseDescriptionStyle}>
          {this.props.description}
        </span>
      )
    } else {
      return null
    }
  }

  renderName() {
    return (
      <span style={this.props.active ? activeNameStyle : baseNameStyle}>
        {this.props.name}
      </span>
    )
  }

  render() {
    const width = this.props.width ? `${this.props.width}px` : '100%'
    const author = this.renderAuthor()
    const image = this.renderImage(width)
    const badges = this.renderBadges()
    const description = this.renderDescription()
    const name = this.renderName()

    let style = baseStyle

    if (this.props.active) {
      style = activeStyle
    } else if (this.props.index % 2 === 1) {
      style = alternateStyle
    }

    return (
      <div
        className={this.props.className + ' hbox'}
        style={style}
        onClick={this.props.onClick.bind(this)}
        onMouseOver={this.props.onMouseOver.bind(this)}>
        <div style={{width: `calc(${width} - 130px)`}}>
          <div>
            {name}
            {author}
          </div>
          {description}
          {badges}
        </div>
        {image}
      </div>
    )
  }

}

ComponentMenuItem.defaultProps = {
  className: '',
  style: {},
  onClick: _.identity,
  onMouseOver: _.identity,
  badges: [],
}

export default ComponentMenuItem
