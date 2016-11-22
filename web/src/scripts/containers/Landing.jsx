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
import { routeActions, } from 'react-router-redux'
import { connect } from 'react-redux'

import { createProject, openProject, } from '../actions/applicationActions'
import { resizeWindow, } from '../actions/uiActions'
import RecentProjectUtils from '../utils/RecentProjectUtils'

import LandingPage from '../components/pages/LandingPage'
import TemplatesPage from '../components/pages/TemplatesPage'

class Landing extends Component {

  state = {
    recentProjects: RecentProjectUtils.getProjectPaths(),
    page: 'landing',
  }

  componentWillMount() {
    this.props.dispatch(resizeWindow({
      width: 640,
      height: 450,
      center: true,
    }))
  }

  onViewLanding = () => this.setState({page: 'landing'})

  onViewTemplates = () => this.setState({page: 'templates'})

  onCreateProject = (category, template) => {
    const {dispatch} = this.props

    console.log('Creating project', category, template)

    if (category === 'React Native') {
      dispatch(createProject())
    } else {
      // ... exponent stuff ...
    }
  }

  renderTemplatesPage = () => {
    return (
      <TemplatesPage
        onCreateProject={this.onCreateProject}
        onBack={this.onViewLanding}
      />
    )
  }

  renderLandingPage = () => {
    const {recentProjects} = this.state

    return (
      <LandingPage
        recentProjects={recentProjects}
        onOpen={(path) => {
          this.props.dispatch(openProject(path))
        }}
        onCreateNew={() => {
          this.props.dispatch(createProject())
        }}
        onViewTemplates={this.onViewTemplates}
      />
    )
  }

  render() {
    const {page} = this.state

    if (page === 'templates') {
      return this.renderTemplatesPage()
    } else {
      return this.renderLandingPage()
    }
  }
}

export default connect()(Landing)
