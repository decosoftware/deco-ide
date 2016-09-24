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

import * as ContentLoader from '../api/ContentLoader'

export default class TabContent extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
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
    const {id} = props
    return ContentLoader.findLoader(id)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.id !== nextProps.id &&
      this.state.loader !== nextState.loader
    )
  }

  getWrappedInstance() {
    return this.refs.wrappedInstance
  }

  render() {
    const {id} = this.props
    const {loader} = this.state

    if (!loader) {
      return <div>Failed to load content</div>
    }

    const element = loader.renderContent(id, loader)

    return React.cloneElement(element, {ref: 'wrappedInstance'})
  }
}
