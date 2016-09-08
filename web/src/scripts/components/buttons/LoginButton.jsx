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

import InspectorButton from './InspectorButton'
import GithubIcon from '../display/GithubIcon'

export default class extends Component {

  static propTypes = {}

  static defaultProps = {}

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {children} = this.props

    return (
      <InspectorButton {...this.props}>
        <GithubIcon />
        <div style={{marginRight: 6}} />
        {'Sign in with GitHub'}
      </InspectorButton>
    )
  }
}
