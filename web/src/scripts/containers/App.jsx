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
import { connect } from 'react-redux'

import Modal from '../components/modal/Modal'
import { popModal } from '../actions/uiActions'

class App extends Component {
  _getModalSettings() {
    if (this.props.modalQueue.length == 0) {
      return {
        visible: false,
        element: null,
      }
    }
    return {
      visible: true,
      element: this.props.modalQueue[0].element,
      closeOnBlur: this.props.modalQueue[0].closeOnBlur,
    }
  }
  render() {
    const modalSettings = this._getModalSettings()
    return (
      <Modal
        setVisibility={(visible) => {
          this.props.dispatch(popModal(visible))
        }}
        closeOnBlur={modalSettings.closeOnBlur}
        modalElement={modalSettings.element}
        visible={modalSettings.visible}>
        {this.props.children}
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    modalQueue: state.ui.modalQueue,
  }
}

export default connect(mapStateToProps)(App)
