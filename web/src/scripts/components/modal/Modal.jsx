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
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class Modal extends Component {
  constructor(props) {
    super(props)
  }
  _hideModal(e) {
    if (this.props.visible) {
      e.preventDefault()
      e.stopPropagation()

      if (this.props.closeOnBlur) {
        this.setModalVisibility(false)
      }
    }
  }
  setModalVisibility(visible) {
    this.props.setVisibility(visible)
  }
  _renderModalChild() {
    if (this.props.modalElement) {
      return React.cloneElement(this.props.modalElement, {
        hideModal: this.setModalVisibility.bind(this, false),
        showModal: this.setModalVisibility.bind(this, true),
      })
    }
    return null
  }
  _renderModal(styles) {
    if (this.props.visible) {
      return (
        <div key={'modal-wrapper'} style={styles.modalContainer}>
          {this._renderModalChild()}
        </div>
      )
    }
    return null
  }
  render() {
    const styles = getStyles(this.props)
    return (
        <div style={styles.container}>
          <div style={styles.appContainer} ref='appContainer' onMouseDown={this._hideModal.bind(this)}>
            {this.props.children}
          </div>
          {this._renderModal(styles)}
        </div>
    )
  }
}

const getStyles = (props) => {
  return {
    container: {
      width: '100%',
      height: '100%',
    },
    appContainer: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0)'
    },
    modalContainer: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 9000,
    }
  }
}

export default Modal
