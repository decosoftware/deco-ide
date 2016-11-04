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
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'

import * as selectors from '../selectors'
import * as URIUtils from '../utils/URIUtils'
import { componentActions, userActions, publishingActions, tabActions } from '../actions'
import { PaneHeader, PublishingBrowser, PublishingMetadata } from '../components'

const styles = {
  container: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  inner: {
    overflowY: 'auto',
    padding: 10,
  }
}

const mapStateToProps = (state) => createSelector(
  ({components}) => components.list,
  ({user}) => !!user.token,
  ({user}) => ({
    authorId: user.authorId,
    name: user.name,
    thumbnail: user.thumbnail,
    username: user.githubId,
  }),
  ({ui: {publishing}}) => ({
    currentComponentId: publishing.currentComponentId
  }),
  selectors.tabContainerId,
  (components, signedIn, user, publishing, tabContainerId) => ({
    components: _.filter(components, ['authorId', user.authorId]),
    signedIn,
    user,
    tabContainerId,
  })
)

const mapDispatchToProps = (dispatch) => ({
  publishingActions: bindActionCreators(publishingActions, dispatch),
  componentActions: bindActionCreators(componentActions, dispatch),
  userActions: bindActionCreators(userActions, dispatch),
  tabActions: bindActionCreators(tabActions, dispatch),
})

class Publishing extends Component {

  componentWillMount() {
    const {componentActions, userActions, signedIn} = this.props

    componentActions.fetchComponents()

    if (signedIn) {
      userActions.fetchUserInfo()
    }
  }

  createComponent = async () => {
    const {componentActions, tabActions, tabContainerId} = this.props

    const {id} = await componentActions.createComponent()
    const uri = URIUtils.componentIdToURI(id)

    tabActions.addTab(tabContainerId, uri)
    tabActions.makeTabPermanent(tabContainerId, uri)
  }

  selectComponent = (component) => {
    const {tabActions, tabContainerId} = this.props
    const uri = URIUtils.componentIdToURI(component.id)

    tabActions.addTab(tabContainerId, uri)
  }

  openComponent = (component, newTab = false) => {
    const {tabActions, tabContainerId} = this.props
    const uri = URIUtils.componentIdToURI(component.id)

    if (newTab) {
      tabActions.splitRight(tabContainerId, uri)
    } else {
      tabActions.addTab(tabContainerId, uri)
    }

    tabActions.makeTabPermanent(tabContainerId, uri)
  }

  signIn = () => {
    this.props.userActions.signIn()
  }

  signOut = () => {
    this.props.userActions.signOut()
  }

  render() {
    const {components, signedIn, user, width} = this.props

    return (
      <div style={styles.container}>
        <PublishingBrowser
          signedIn={signedIn}
          user={user}
          components={components}
          onSignIn={this.signIn}
          onSignOut={this.signOut}
          onSelectComponent={this.selectComponent}
          onCreateComponent={this.createComponent}
          onOpenComponent={this.openComponent}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Publishing)
