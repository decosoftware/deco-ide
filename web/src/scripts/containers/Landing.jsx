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
import { StylesProvider } from 'react-styles-provider'
import path from 'path'
const { app } = Electron.remote

import * as themes from '../themes'
import { createProject, openProject, } from '../actions/applicationActions'
import { resizeWindow } from '../actions/uiActions'
import RecentProjectUtils from '../utils/RecentProjectUtils'
import * as Exponent from '../utils/Exponent'
import * as ProjectTemplateUtils from '../utils/ProjectTemplateUtils'
import * as ProjectTemplateConstants from '../constants/ProjectTemplateConstants'
import LandingPage from '../components/pages/LandingPage'
import TemplatesPage from '../components/pages/TemplatesPage'
import ProjectCreationPage from '../components/pages/ProjectCreationPage'
import LoadingPage from '../components/pages/LoadingPage'

import selectProject from '../utils/selectProject'
import { SET_PROJECT_DIR } from 'shared/constants/ipc/ProjectConstants'

class Landing extends Component {

  state = {
    recentProjects: RecentProjectUtils.getProjectPaths(),
    page: 'landing',
    template: null,
    selectedCategory: ProjectTemplateConstants.CATEGORY_REACT_NATIVE,
    selectedTemplateIndex: null,
    projectName: 'Project',
    projectDirectory: app.getPath('home'),
    loadingText: 'Loading...'
  }

  componentWillMount() {
    this.props.dispatch(resizeWindow({
      width: 640,
      height: 450,
      center: true,
    }))
  }

  onSelectCategory = (selectedCategory) => this.setState({selectedCategory})

  onViewLanding = () => this.setState({page: 'landing'})

  onViewTemplates = () => this.setState({page: 'templates'})

  onProjectNameChange = (projectName) => {
    const {selectedCategory} = this.state
    const sanitizedName = ProjectTemplateUtils.sanitizeProjectName(projectName, selectedCategory)

    this.setState({projectName: sanitizedName})
  }

  onProjectDirectoryChange = (projectDirectory) => this.setState({projectDirectory})

  onSelectTemplate = (selectedTemplateIndex) => {
    const {selectedCategory, projectName} = this.state
    const sanitizedName = ProjectTemplateUtils.sanitizeProjectName(projectName, selectedCategory)

    this.setState({
      page: 'projectCreation',
      selectedTemplateIndex,
      projectName: sanitizedName,
    })
  }

  onCreateProject = async () => {
    const {dispatch} = this.props
    const {selectedCategory, selectedTemplateIndex, projectName, projectDirectory} = this.state
    const template = ProjectTemplateConstants.TEMPLATES_FOR_CATEGORY[selectedCategory][selectedTemplateIndex]

    if (!ProjectTemplateUtils.isValidProjectName(projectName, selectedCategory)) return

    this.setState({page: 'loading', loadingText: 'Downloading and extracting project'})

    if (selectedCategory === ProjectTemplateConstants.CATEGORY_EXPONENT) {
      const progressCallback = (loadingText) => this.setState({loadingText})

      await Exponent.createProject(projectName, projectDirectory, template, progressCallback)

      selectProject({
        type: SET_PROJECT_DIR,
        absolutePath: new Buffer(path.join(projectDirectory, projectName)).toString('hex'),
        isTemp: false,
      }, dispatch)
    } else {

      // TODO actually use the selected project name & directory
      dispatch(createProject())
    }
  }

  renderProjectCreationPage = () => {
    const {selectedCategory, selectedTemplateIndex, projectName, projectDirectory} = this.state

    return (
      <ProjectCreationPage
        projectName={projectName}
        projectDirectory={projectDirectory}
        template={ProjectTemplateConstants.TEMPLATES_FOR_CATEGORY[selectedCategory][selectedTemplateIndex]}
        onProjectNameChange={this.onProjectNameChange}
        onProjectDirectoryChange={this.onProjectDirectoryChange}
        onCreateProject={this.onCreateProject}
        onBack={this.onViewTemplates}
      />
    )
  }

  renderTemplatesPage = () => {
    const {selectedCategory} = this.state

    return (
      <TemplatesPage
        categories={ProjectTemplateConstants.CATEGORIES}
        templates={ProjectTemplateConstants.TEMPLATES_FOR_CATEGORY[selectedCategory]}
        selectedCategory={selectedCategory}
        onSelectCategory={this.onSelectCategory}
        onSelectTemplate={this.onSelectTemplate}
        onBack={this.onViewLanding}
      />
    )
  }

  renderLoadingPage = () => {
    const {loadingText} = this.state

    return (
      <LoadingPage text={loadingText} />
    )
  }

  renderLandingPage = () => {
    const {recentProjects} = this.state

    return (
      <LandingPage
        recentProjects={recentProjects}
        onOpen={(path) => this.props.dispatch(openProject(path))}
        onCreateNew={() => this.props.dispatch(createProject())}
        onViewTemplates={this.onViewTemplates}
        showTemplates={SHOW_PROJECT_TEMPLATES}
      />
    )
  }

  renderPage = () => {
    const {page} = this.state

    switch (page) {
      case 'templates':
        return this.renderTemplatesPage()
      case 'projectCreation':
        return this.renderProjectCreationPage()
      case 'loading':
        return this.renderLoadingPage()
      default:
        return this.renderLandingPage()
    }
  }

  render() {
    return (
      <StylesProvider theme={themes.light}>
        {this.renderPage()}
      </StylesProvider>
    )
  }
}

export default connect()(Landing)
