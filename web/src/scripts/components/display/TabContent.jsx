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
import pureRender from 'pure-render-decorator'

import * as ContentLoader from '../../api/ContentLoader'
import NoContent from './NoContent'

@pureRender
export default class TabContent extends Component {

  static propTypes = {
    uri: PropTypes.string,
    tabGroupIndex: PropTypes.number,
    tabContainerId: PropTypes.string,
  }

  constructor(props) {
    super()
    this.state = this.mapPropsToState(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.mapPropsToState(nextProps))
  }

  mapPropsToState(props) {
    return {loader: this.findLoader(props)}
  }

  findLoader(props) {
    const {uri} = props
    return ContentLoader.findLoader(uri)
  }

  getWrappedInstance() {
    return this.refs.wrappedInstance
  }

  render() {
    const {loader} = this.state

    if (!loader) {
      return (
        <NoContent>
          Welcome to Deco
          <br />
          <br />
          Open a file in the Project Browser on the left to get started.
        </NoContent>
      )
    }

    const element = loader.renderContent(this.props, loader)

    return React.cloneElement(element, {ref: 'wrappedInstance'})
  }
}
