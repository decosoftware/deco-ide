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

import {UserDetailsBanner, InspectorButton} from '../components'

const styles = {
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    paddingTop: 15,
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
}

const Publishing = ({user, components}) => {
  const {firstname, lastname, username, thumbnail} = user
  const downloadCount = components.reduce((sum, component) => sum + component.downloads, 0)

  return (
    <div style={styles.container}>
      <UserDetailsBanner
        firstname={firstname}
        lastname={lastname}
        username={username}
        thumbnail={thumbnail}
        componentCount={components.length}
        downloadCount={downloadCount}
      />
      <div style={styles.inner}>
        <InspectorButton type={'main'}>New Component</InspectorButton>
        <div style={{marginBottom: 20}} />
        <div style={styles.header}>Published Components</div>
        {components.map(({name, repository}, i) => {
          const style = {marginBottom: i === components.length ? 0 : 10}

          return (
            <div style={style} key={repository}>
              <InspectorButton align={'left'}>
                {name}<span style={styles.componentDetails}> | {repository}</span>
              </InspectorButton>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default connect()(Publishing)
