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

import { componentActions, userActions, publishingActions } from '../actions'
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
  (components, signedIn, user, publishing) => ({
    components: _.filter(components, ['authorId', user.authorId]),
    signedIn,
    user,
    currentComponent: publishing.currentComponentId ?
      _.find(components, ['id', publishing.currentComponentId]) : null
  })
)

const mapDispatchToProps = (dispatch) => ({
  publishingActions: bindActionCreators(publishingActions, dispatch),
  componentActions: bindActionCreators(componentActions, dispatch),
  userActions: bindActionCreators(userActions, dispatch),
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
    const {id} = await this.props.componentActions.createComponent()
    this.props.publishingActions.setCurrentComponent(id)
  }

  updateComponent = (component) => {
    this.props.componentActions.updateComponent(component)
  }

  deleteComponent = (component) => {
    this.props.publishingActions.setCurrentComponent(null)
    this.props.componentActions.deleteComponent(component)
  }

  selectComponent = (component) => {
    this.props.publishingActions.setCurrentComponent(component.id)
  }

  deselectCurrentComponent = () => {
    this.props.publishingActions.setCurrentComponent(null)
  }

  signIn = () => {
    this.props.userActions.signIn()
  }

  signOut = () => {
    this.props.userActions.signOut()
  }

  render() {
    const {currentComponent, components, signedIn, user, width} = this.props

    return (
      <div style={styles.container}>
        {currentComponent && (
          <PaneHeader
            leftTitle={'Back'}
            onClickLeftTitle={this.deselectCurrentComponent}
          />
        )}
        {currentComponent ? (
          <PublishingMetadata
            user={user}
            component={currentComponent}
            width={width}
            onUpdateComponent={this.updateComponent}
            onDeleteComponent={this.deleteComponent}
          />
        ) : (
          <PublishingBrowser
            signedIn={signedIn}
            user={user}
            components={components}
            onSignIn={this.signIn}
            onSignOut={this.signOut}
            onSelectComponent={this.selectComponent}
            onCreateComponent={this.createComponent}
          />
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Publishing)
