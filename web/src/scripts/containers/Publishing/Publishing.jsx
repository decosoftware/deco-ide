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

import PublishingSignIn from './PublishingSignIn'
import PublishingBrowser from './PublishingBrowser'
import PublishingMetadata from './PublishingMetadata'
import {PaneHeader} from '../../components'

const styles = {
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    overflowY: 'auto',
    padding: 10,
  }
}

const PublishingInspector = ({signedIn, user, components, currentComponentId, width}) => {
  const currentComponent = currentComponentId ?
    _.find(components, ['id', currentComponentId]) : null

  return (
    <div style={styles.container}>
      <PaneHeader
        text={'Publishing'}
        rightTitle={signedIn ? 'Sign out' : null}
        onClickRightTitle={() => {console.log('Sign out?')}}
      />
      {signedIn ? (
        currentComponent ? (
          <PublishingMetadata
            user={user}
            component={currentComponent}
            width={width}
          />
        ) : (
          <PublishingBrowser
            user={user}
            components={components}
          />
        )
      ) : (
        <PublishingSignIn />
      )}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    signedIn: true,
    user: {
      username: 'dabbott',
      firstname: 'Devin',
      lastname: 'Abbott',
      thumbnail: 'https://avatars0.githubusercontent.com/u/1198882?v=3&s=460',
    },
    currentComponentId: '1',
    components: [
      {
        name: 'Button',
        id: '1',
        repository: 'dabbott/button',
        downloads: 214,
        props: [
          {
            value: 'Press me!',
            metadata: {
              name: 'title',
              type: 'string',
              editWith: 'inputField',
            },
          },
          {
            value: 'rgb(210,210,210)',
            metadata: {
              name: 'textColor',
              type: 'string',
              editWith: 'colorPicker',
            },
          },
        ],
        dependencies: {
          'react-native': '*',
        },
        imports: {
          'react-native-button': 'Button',
        },
      },
      {
        name: 'PhotoGrid',
        id: '2',
        repository: 'dabbott/photo-grid',
        downloads: 88,
      },
      {
        name: 'Lightbox',
        id: '3',
        repository: 'dabbott/lightbox',
        downloads: 43,
      },
    ],
  }
}

export default connect(mapStateToProps)(PublishingInspector)
