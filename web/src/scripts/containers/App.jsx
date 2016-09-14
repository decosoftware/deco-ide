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
import * as theme from '../themes/dark'

// var context = require.context("../components/", true, /\.jsx$/); // is a directory with .js files
// var modules = {};
// context.keys().forEach(function (key) {
//   var module = context(key);
//   modules[key] = module;
//   customReloadLogic(key, module, false);
// })
//
// if (module.hot) {
//   module.hot.accept(context.id, function () {
//     //You can't use context here. You _need_ to call require.context again to
//     //get the new version. Otherwise you might get errors about using disposed
//     //modules
//     var reloadedContext = require.context("../", true, /\.jsx$/);
//     //To find out what module was changed you just compare the result of the
//     //require call with the version stored in the modules hash using strict
//     //equality. Equal means it is unchanged.
//     var changedModules = reloadedContext.keys()
//       .map(function (key) {
//         return [key, reloadedContext(key)];
//       })
//       .filter(function (reloadedModule) {
//         return modules[reloadedModule[0]] !== reloadedModule[1];
//       });
//     changedModules.forEach(function (module) {
//       modules[module[0]] = module[1];
//       customReloadLogic(module[0], module[1], true);
//     });
//   });
// }
//
// function customReloadLogic(name, module, isReload) {
//   console.log("module " + name + (isReload ? " re" : " ") + "loaded");
// }

class App extends Component {

  static childContextTypes = {
    theme: React.PropTypes.object,
  }

  getChildContext() {
    return {theme}
  }

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
