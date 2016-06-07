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
import classNames from 'classnames'
import PureRenderMixin from 'react-addons-pure-render-mixin'

const styles = {
  toggleLabelBase: {
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  },
  toggleCheck: {
    color: '#FAFAFA',
    top: -1,
  },
  toggleX: {
    color: 'rgba(255,255,255,0.6)',
    top: -1,
    marginRight: 2,
  }
}

class SwitchButton extends Component {

  constructor(props) {
    super()
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    var checked = false;
    if ('checked' in props) {
      checked = props.checked
    } else if ('defaultChecked' in this.props) {
      checked = props.defaultChecked
    }
    this.state = {
      checked: !!checked,
      hasFocus: false
    }

  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({checked: !!nextProps.checked})
    }
  }

  handleClick(event) {
    var checkbox = this.refs.input
    if (event.target !== checkbox)
    {
      event.preventDefault()
      checkbox.focus()
      checkbox.click()
      return
    }

    if (!('checked' in this.props)) {
      this.setState({checked: checkbox.checked})
    }
  }

  handleFocus() {
    this.setState({hasFocus: true})
  }

  handleBlur() {
    this.setState({hasFocus: false})
  }

  render() {
    var classes = classNames('react-toggle', {
      'react-toggle--checked': this.state.checked,
      'react-toggle--focus': this.state.hasFocus,
      'react-toggle--disabled': this.props.disabled
    })

    return (
      <div className={classes} onClick={this.handleClick}>
        <div className="react-toggle-track">
          <div className="react-toggle-track-check" style={{
              ...styles.toggleLabelBase,
              ...styles.toggleCheck,
            }}>
            {this.props.onStateLabel}
          </div>
          <div className="react-toggle-track-x" style={{
            ...styles.toggleLabelBase,
            ...styles.toggleX,
            }}>
            {this.props.offStateLabel}
          </div>
        </div>
        <div className="react-toggle-thumb"></div>

        <input
          ref="input"
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          className="react-toggle-screenreader-only"
          type="checkbox"
          {...this.props} />
      </div>
    )
  }
}

SwitchButton.propTypes = {
  checked: React.PropTypes.bool,
  defaultChecked: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  name: React.PropTypes.string,
  value: React.PropTypes.string,
  id: React.PropTypes.string,
  onStateLabel: React.PropTypes.string,
  offStateLabel: React.PropTypes.string,
}

SwitchButton.defaultProps = {
  onStateLabel: 'ON',
  offStateLabel: 'OFF',
}

SwitchButton.displayName = 'Toggle'

export default SwitchButton
