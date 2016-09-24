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
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

import InspectorButton from '../buttons/InspectorButton'
import UserDetailsBanner from '../user/UserDetailsBanner'
import ComponentBrowser from '../../containers/ComponentBrowser'
import PublishingSignIn from './PublishingSignIn'

const stylesCreator = ({colors, fonts}) => ({
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    flex: 0,
    overflowY: 'auto',
    padding: 10,
    borderBottom: `1px solid ${colors.dividerInverted}`,
  },
  header: {
    color: 'rgb(114,114,114)',
    fontWeight: 500,
    lineHeight: '12px',
    marginBottom: 10,
  },
  componentDetails: {
    fontWeight: 300,
    whiteSpace: 'pre',
    color: 'rgb(180,180,180)',
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PublishingBrowser extends Component {

  renderSignedOut() {
    const {onSignIn} = this.props

    return (
      <PublishingSignIn
        onClickSignIn={onSignIn}
      />
    )
  }

  renderSignedIn() {
    const {styles, user, components, onCreateComponent, onSignOut} = this.props
    const {name, username, thumbnail} = user
    const downloadCount = components.reduce((sum, component) => sum + (component.downloads || 0), 0)

    return [
      <UserDetailsBanner
        key={'user'}
        name={name}
        username={username}
        thumbnail={thumbnail}
        componentCount={components.length}
        downloadCount={downloadCount}
        onSignOut={onSignOut}
      />,
      <div key={'inner'} style={styles.inner}>
        <InspectorButton
          type={'main'}
          onClick={onCreateComponent}
        >
          New Component
        </InspectorButton>
      </div>,
    ]
  }

  render() {
    const {styles, signedIn, user, onSelectComponent} = this.props

    return (
      <div style={styles.container}>
        {signedIn ? this.renderSignedIn() : this.renderSignedOut()}
        <ComponentBrowser
          onClickItem={onSelectComponent}
        />
      </div>
    )
  }
}
