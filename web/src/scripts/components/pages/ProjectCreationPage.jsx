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
import path from 'path'

import DecoLogo from '../display/DecoLogo'
import LandingButton from '../buttons/LandingButton'
import ProjectListItem from '../buttons/ProjectListItem'
import NewIcon from '../display/NewIcon'
import PropertyStringInput from '../inspector/PropertyStringInput'
import PropertyFileInput from '../inspector/PropertyFileInput'

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
  bottom: {
    display: 'flex',
    flex: '0 0 auto',
    backgroundColor: 'rgb(250,250,250)',
    borderTop: '1px solid #E7E7E7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
  },
  paneContainer: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
    borderTop: '1px solid #E7E7E7',
  },
  categoriesPane: {
    flex: '0 0 auto',
  },
  logoContainer: {
    flex: '0 0 auto',
    padding: '35px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    WebkitAppRegion: 'drag',
  },
  detailsPane: {
    flex: '1 1 auto',
    paddingTop: 30,
    paddingRight: 30,
  },
  template: {
    padding: 30,
  },
  templateTitle: {
    paddingBottom: 10,
    fontSize: 14,
    fontWeight: 300,
  },
  templateImage: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    backgroundSize: 'cover',
  },
  propertySpacer: {
    marginBottom: 30,
  },
}

export default class ProjectCreationPage extends Component {

  renderTemplate = ({name, iconUrl}) => {
    return (
      <div style={styles.template}>
        <div style={styles.templateTitle}>
          {name}
        </div>
        <div style={{...styles.templateImage, backgroundImage: `url(${iconUrl})`}} />
      </div>
    )
  }

  render() {
    const {
      onBack,
      template,
      onProjectNameChange,
      onProjectDirectoryChange,
      onCreateProject,
      projectName,
      projectDirectory,
    } = this.props

    return (
      <div className='helvetica-smooth' style={styles.container}>
        <div style={styles.top}>
          <div style={styles.logoContainer}>
            <DecoLogo />
          </div>
          <div style={styles.paneContainer}>
            <div style={styles.categoriesPane}>
              {this.renderTemplate(template)}
            </div>
            <div style={styles.detailsPane}>
              <PropertyStringInput
                title={'Project Name'}
                value={projectName}
                onChange={onProjectNameChange}
                autoFocus={true}
              />
              <div style={styles.propertySpacer} />
              <PropertyFileInput
                title={'Project Location'}
                value={path.resolve(projectDirectory, projectName)}
                onChange={onProjectDirectoryChange}
                disabled={true}
              />
            </div>
          </div>
        </div>
        <div style={styles.bottom}>
          <LandingButton onClick={onBack}>
            Back
          </LandingButton>
          <LandingButton onClick={onCreateProject}>
            <NewIcon />
            Create Project
          </LandingButton>
        </div>
      </div>
    )
  }
}
