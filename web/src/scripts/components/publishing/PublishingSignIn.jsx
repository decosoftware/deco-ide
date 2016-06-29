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

import LoginButton from '../buttons/LoginButton'
import Callout from '../display/Callout'

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

export default (props) => {
  const {onClickSignIn} = props

  return (
    <div style={styles.container}>
      <Callout isTop={true}>
        <b>Publishing with Deco: </b>
        <br />
        Deco makes it extremely quick and easy to publish components to <b>GitHub</b> and <b>npm</b> for use in your other projects, by your team, and by other React Native developers.
      </Callout>
      <div style={styles.inner}>
        <LoginButton onClick={onClickSignIn} />
      </div>
    </div>
  )
}
