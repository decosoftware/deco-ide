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

import SignIn from './SignIn'
import Publishing from './Publishing'
import {PaneHeader} from '../components'

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

const PublishingInspector = ({signedIn, user, components}) => {
  return (
    <div style={styles.container}>
      <PaneHeader
        text={'Publishing'}
        rightTitle={signedIn ? 'Sign out' : null}
        onClickRightTitle={() => {console.log('Sign out?')}}
      />
      {signedIn ? (
        <Publishing
          user={user}
          components={components}
        />
      ) : (
        <SignIn />
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
    components: [
      {
        name: 'Button',
        repository: 'dabbott/button',
        downloads: 214,
      },
      {
        name: 'PhotoGrid',
        repository: 'dabbott/photo-grid',
        downloads: 88,
      },
      {
        name: 'Lightbox',
        repository: 'dabbott/lightbox',
        downloads: 43,
      },
    ],
  }
}

export default connect(mapStateToProps)(PublishingInspector)
