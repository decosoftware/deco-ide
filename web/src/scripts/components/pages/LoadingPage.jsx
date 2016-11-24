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

import React, { Component, PropTypes } from 'react'

import DecoLogo from '../display/DecoLogo'

const styles = {
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: "#ffffff",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  top: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
  },
  content: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
    borderTop: '1px solid #E7E7E7',
  },
  logoContainer: {
    flex: '0 0 auto',
    padding: '35px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    WebkitAppRegion: 'drag',
  },
  spinner: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    WebkitMaskImage: 'url("images/loading-spinner.svg")',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: '24px 24px',
    width: 24,
    height: 24,
  },
  text: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: '12px',
    color: '#898989',
    fontWeight: 300,
  },
}

export default class ProjectCreationPage extends Component {
  render() {
    const {text} = this.props

    return (
      <div className='helvetica-smooth' style={styles.container}>
        <div style={styles.top}>
          <div style={styles.logoContainer}>
            <DecoLogo />
          </div>
          <div style={styles.content}>
            <div style={styles.spinner} />
            <div style={styles.text}>
              {text}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
