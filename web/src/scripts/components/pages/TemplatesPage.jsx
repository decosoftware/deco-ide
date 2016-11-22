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
import LandingButton from '../buttons/LandingButton'
import ProjectListItem from '../buttons/ProjectListItem'

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
    flex: '0 0 180px',
    overflowY: 'auto',
    borderRight: '1px solid rgba(0,0,0,0.05)',
  },
  category: {
    padding: '20px 25px',
    fontSize: 14,
    fontWeight: 300,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  logoContainer: {
    flex: '0 0 auto',
    padding: '35px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    WebkitAppRegion: 'drag',
  },
  templatesPane: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
    paddingLeft: 20,
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
}

styles.categoryActive = {
  ...styles.category,
  fontWeight: 'bold',
  backgroundColor: 'rgba(0,0,0,0.05)',
}

styles.templateActive = {
  ...styles.template,
  backgroundColor: 'rgb(79,139,229)',
  color: 'white',
}

const CATEGORIES = [
  'React Native',
  'Exponent',
]

const TEMPLATES_FOR_CATEGORY = {
  'React Native': reactNative,
  'Exponent': exponent,
}

export default class TemplatesPage extends Component {

  state = {
    selectedCategory: CATEGORIES[0],
    selectedTemplateIndex: null,
  }

  onSelectCategory = (title) => this.setState({
    selectedCategory: title,
    selectedTemplateIndex: null,
  })

  onSelectTemplate = (index) => this.setState({
    selectedTemplateIndex: index,
  })

  renderCategory = (title, i) => {
    const {selectedCategory} = this.state

    return (
      <div
        key={i}
        style={title === selectedCategory ? styles.categoryActive : styles.category}
        onClick={this.onSelectCategory.bind(this, title)}
      >
        {title}
      </div>
    )
  }

  renderTemplate = ({name, iconUrl}, i) => {
    const {selectedTemplateIndex} = this.state

    return (
      <div
        key={i}
        style={i === selectedTemplateIndex ? styles.templateActive : styles.template}
        onClick={this.onSelectTemplate.bind(this, i)}
      >
        <div style={styles.templateTitle}>
          {name}
        </div>
        <div style={{...styles.templateImage, backgroundImage: `url(${iconUrl})`}} />
      </div>
    )
  }

  onCreateProject = () => {
    const {onCreateProject} = this.props
    const {selectedCategory, selectedTemplateIndex} = this.state

    // Make sure we've picked a template
    if (selectedTemplateIndex === null) return

    const template = TEMPLATES_FOR_CATEGORY[selectedCategory][selectedTemplateIndex]

    onCreateProject(selectedCategory, template)
  }

  render() {
    const {onBack} = this.props
    const {selectedCategory} = this.state

    return (
      <div className='helvetica-smooth' style={styles.container}>
        <div style={styles.top}>
          <div style={styles.logoContainer}>
            <DecoLogo />
          </div>
          <div style={styles.paneContainer}>
            <div style={styles.categoriesPane}>
              {CATEGORIES.map(this.renderCategory)}
            </div>
            <div style={styles.templatesPane}>
              {TEMPLATES_FOR_CATEGORY[selectedCategory].map(this.renderTemplate)}
            </div>
          </div>
        </div>
        <div style={styles.bottom}>
          <LandingButton onClick={onBack}>
            Back
          </LandingButton>
          <LandingButton onClick={this.onCreateProject}>
            Create Project
          </LandingButton>
        </div>
      </div>
    )
  }
}
