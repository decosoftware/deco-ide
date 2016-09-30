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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import { batchActions } from 'redux-batched-subscribe'

import * as selectors from '../selectors'
import * as ContentLoader from '../api/ContentLoader'
import * as URIUtils from '../utils/URIUtils'
import { tabActions, componentActions } from '../actions'
import { PublishingMetadata } from '../components'

const stylesCreator = () => ({})

const mapStateToProps = (state, props) => createSelector(
  selectors.componentById,
  (component) => ({
    component,
  })
)

const mapDispatchToProps = (dispatch) => ({
  tabActions: bindActionCreators(tabActions, dispatch),
  componentActions: bindActionCreators(componentActions, dispatch),
  dispatch,
})

@StylesEnhancer(stylesCreator)
class ComponentEditor extends Component {

  updateComponent = (component) => {
    const {dispatch, tabContainerId, tabGroupIndex, uri} = this.props

    dispatch(batchActions([
      componentActions.updateComponent(component),
      tabActions.focusTab(tabContainerId, uri, tabGroupIndex),
      tabActions.makeTabPermanent(tabContainerId, uri, tabGroupIndex),
    ]))
  }

  deleteComponent = (component) => {
    const {dispatch, tabContainerId, uri} = this.props

    dispatch(batchActions([
      componentActions.deleteComponent(component),
      tabActions.closeAllTabsForResource(tabContainerId, uri),
    ]))
  }

  render() {
    const {styles, component} = this.props

    if (!component) return null

    return (
      <PublishingMetadata
        component={component}
        onUpdateComponent={this.updateComponent}
        onDeleteComponent={this.deleteComponent}
      />
    )
  }
}

const ConnectedClass = connect(mapStateToProps, mapDispatchToProps)(ComponentEditor)

export default ConnectedClass

export const registerLoader = () => {
  const loaderId = 'com.decosoftware.component.editor'

  ContentLoader.registerLoader({
    name: 'Component',
    id: loaderId,
    filter: (uri) => (
      uri.startsWith('component://') ||
      URIUtils.getParam(uri, 'loader') === loaderId
    ),
    getResourceName: (uri, state) => {
      const id = URIUtils.withoutProtocolOrParams(uri)
      const component = selectors.componentById(state, {id})

      if (component) {
        return component.name
      } else {
        return ''
      }
    },
    renderContent: ({uri, tabContainerId, tabGroupIndex}) => (
      <ConnectedClass
        uri={uri}
        tabContainerId={tabContainerId}
        tabGroupIndex={tabGroupIndex}
        id={URIUtils.withoutProtocolOrParams(uri)}
      />
    ),
  })
}
