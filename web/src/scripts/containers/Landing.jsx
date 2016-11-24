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
import * as ModuleClient from '../clients/ModuleClient'

import LandingPage from '../components/pages/LandingPage'
import TemplatesPage from '../components/pages/TemplatesPage'
import ProjectCreationPage from '../components/pages/ProjectCreationPage'
import LoadingPage from '../components/pages/LoadingPage'

const reactNative = [
  {
    "id": "blank",
    "name": "Blank",
    "description": "The Blank project template includes the minimum dependencies to run and an empty root component.",
    "version": "0.36.0",
    "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_blank.png"
  }
]

const exponent = [
  {
    "id": "blank",
    "name": "Blank",
    "description": "The Blank project template includes the minimum dependencies to run and an empty root component.",
    "version": "1.7.4",
    "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_blank.png"
  },
  {
    "id": "tabs",
    "name": "Tab Navigation",
    "description": "The Tab Navigation project template includes several example screens.",
    "version": "1.7.4",
    "iconUrl": "https://s3.amazonaws.com/exp-starter-apps/template_icon_tabs.png"
  }
]

const CATEGORIES = [
  'React Native',
  'Exponent',
]

const TEMPLATES_FOR_CATEGORY = {
  'React Native': reactNative,
  'Exponent': exponent,
}

import selectProject from '../utils/selectProject';

import { SET_PROJECT_DIR } from 'shared/constants/ipc/ProjectConstants'

const xdl = Electron.remote.require('xdl');
const {
  User,
  Exp,
} = xdl;

class Landing extends Component {

  state = {
    recentProjects: RecentProjectUtils.getProjectPaths(),
    page: 'landing',
    template: null,
    selectedCategory: CATEGORIES[0],
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

  isValidProjectName = (projectName) => {
    const {selectedCategory} = this.state

    if (projectName.length === 0) {
      return false
    }

    if (selectedCategory === 'Exponent') {
      return !!projectName[0].match(/[a-z]/)
    }

    return !!projectName[0].match(/[A-Z]/)
  }

  sanitizeProjectName = (projectName) => {
    const {selectedCategory} = this.state

    if (selectedCategory === 'Exponent') {
      return projectName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
    }

    const upperFirstName = projectName.length > 0
      ? projectName[0].toUpperCase() + projectName.slice(1)
      : projectName

    return upperFirstName.replace(/[^a-zA-Z0-9_-]/g, '')
  }

  onSelectCategory = (selectedCategory) => this.setState({selectedCategory})

  onViewLanding = () => this.setState({page: 'landing'})

  onViewTemplates = () => this.setState({page: 'templates'})

  onProjectNameChange = (projectName) => this.setState({projectName: this.sanitizeProjectName(projectName)})

  onProjectDirectoryChange = (projectDirectory) => this.setState({projectDirectory})

  onSelectTemplate = (selectedTemplateIndex) => {
    const {projectName} = this.state

    this.setState({
      page: 'projectCreation',
      selectedTemplateIndex,
      projectName: this.sanitizeProjectName(projectName),
    })
  }

  onCreateProject = async () => {
    const {selectedCategory, selectedTemplateIndex, projectName, projectDirectory} = this.state
    const template = TEMPLATES_FOR_CATEGORY[selectedCategory][selectedTemplateIndex]

    if (!this.isValidProjectName(projectName)) return

    console.log('create project', projectName, projectDirectory, template)

    this.setState({page: 'loading', loadingText: 'Downloading and extracting project'})

    if (selectedCategory === 'React Native') {
      // dispatch(createProject())
    } else {
      await this._createExponentProjectAsync(projectName, projectDirectory, template);
    }

    await this.installDependenciesAsync()

    selectProject({
      type: SET_PROJECT_DIR,
      absolutePath: new Buffer(projectDirectory + '/'+ projectName).toString('hex'),
      isTemp: false,
    } , this.props.dispatch);
  }

  installDependenciesAsync = async () => {
    const {projectDirectory, projectName} = this.state

    await ModuleClient.importModule({
      name: '@exponent/minimal-packager',
      path: projectDirectory + '/' + projectName,
    }, (({percent}) => {
      this.setState({loadingText: `Installing packages (${Math.ceil(percent * 100)})`})
    }))

    this.setState({loadingText: `All done!?`})
  }

  renderProjectCreationPage = () => {
    const {selectedCategory, selectedTemplateIndex, projectName, projectDirectory} = this.state

    return (
      <ProjectCreationPage
        projectName={projectName}
        projectDirectory={projectDirectory}
        template={TEMPLATES_FOR_CATEGORY[selectedCategory][selectedTemplateIndex]}
        onProjectNameChange={this.onProjectNameChange}
        onProjectDirectoryChange={this.onProjectDirectoryChange}
        onCreateProject={this.onCreateProject}
        onBack={this.onViewTemplates}
      />
    )
  }

  // Currently this only accepts template but it will accept name and/or path (name can be
  // inferred from path if we just take the last part of path).
  async _createExponentProjectAsync(projectName, projectDirectory, template) {
    try {
      // IS USER SIGNED IN? USE THEIR ACCOUNT. OTHERWISE USE OUR DUMB ACCOUNT.
      // NOTE THAT THIS LOOKS IT UP IN ~/.exponent
      let user = await User.getCurrentUserAsync();

      if (!user) {
        user = await User.loginAsync({
          username: 'deco', password: 'password'
        });
      }

      // ACTUALLY CREATE THE PROJECT
      let projectRoot = await Exp.createNewExpAsync(
        template.id,          // Template id
        projectDirectory,     // Parent directory where to place the project
        {},                   // Any extra fields to add to package.json
        {name: projectName}   // Options, currently only name is supported
      );
    } catch(e) {
      alert(e.message);
    }
  }

  renderTemplatesPage = () => {
    const {selectedCategory} = this.state

    return (
      <TemplatesPage
        categories={CATEGORIES}
        templates={TEMPLATES_FOR_CATEGORY[selectedCategory]}
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
