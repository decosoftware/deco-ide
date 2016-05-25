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
import _ from 'lodash'

const WRAPPED_EVENTS = [
  'onMouseUp',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onClick',
]

const BUTTON_EVENTS = {
  onMouseDown: function() {
    this.setState({active: true})
  },
  onMouseUp: function() {
    this.setState({active: false})
  },
  onMouseEnter: function() {
    this.setState({hover: true})
  },
  onMouseLeave: function() {
    this.setState({hover: false})
  },
  onClick: function() {
    const enabled = ! this.props.enabled
    this.props.onChange && this.props.onChange(enabled)
  },
}

class TwoStateButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hover: false,
      active: false,
    }
  }

  buildStyle(childProps) {
    const style = childProps.style ? _.clone(childProps.style) : {}

    if (this.props.enabled) {
      if (this.props.enabledStyle) {
        Object.assign(style, this.props.enabledStyle)
      }

      if (this.state.hover && this.props.enabledHoverStyle) {
        Object.assign(style, this.props.enabledHoverStyle)
      } else if (this.state.active && this.props.enabledActiveStyle) {
        Object.assign(style, this.props.enabledActiveStyle)
      }
    } else {
      if (this.state.hover && this.props.hoverStyle) {
        Object.assign(style, this.props.hoverStyle)
      } else if (this.state.active && this.props.activeStyle) {
        Object.assign(style, this.props.activeStyle)
      }
    }

    return style
  }

  render() {
    const children = React.Children.map(this.props.children, (child) => {
      const events = {}

      _.each(WRAPPED_EVENTS, (eventName) => {
        const originalHandler = child.props[eventName]
        const buttonHandler = BUTTON_EVENTS[eventName].bind(this)

        if (originalHandler) {
          events[eventName] = (...args) => {
            buttonHandler()
            originalHandler(...args)
          }
        } else {
          events[eventName] = () => {
            buttonHandler()
          }
        }
      })

      return React.cloneElement(child, Object.assign({
        hover: this.state.hover,
        active: this.state.active,
        enabled: this.props.enabled,
        style: this.buildStyle(child.props),
        ref: this.state.childRef,
      }, events))
    })

    return children[0]
  }
}

TwoStateButton.propTypes = {
  children: PropTypes.element.isRequired,
  styles: PropTypes.object,
  enabled: PropTypes.bool,
}

TwoStateButton.defaultProps = {
}

export default TwoStateButton
