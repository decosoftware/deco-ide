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

import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'

import PaneHeader from '../components/headers/PaneHeader'
import {
  FilterableList,
  DraggableComponentMenuItem,
} from '../components'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

const styles = {
  main: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  inner: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}

const PANE_HEADER_HEIGHT = 32
const SEARCHBAR_HEIGHT = 38

class ComponentBrowser extends Component {
  render() {
    const {componentList, style} = this.props

    return (
      <div className={'project-navigator vbox ' + this.props.className}
        style={{...styles.main, ...style}}>
        <PaneHeader text={'Components'} />
        <div style={styles.inner}>
          <FilterableList
            ItemComponent={DraggableComponentMenuItem}
            items={componentList}
            onSelectItem={(item) => {console.log('select item', item)}}
            autoSelectFirst={false}
          />
        </div>
      </div>
    )
  }
}

ComponentBrowser.defaultProps = {
  className: '',
  style: {},
}

const mapStateToProps = (state) => ({
  componentList: state.preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE] ?
    state.components.list : state.modules.modules
})

export default connect(mapStateToProps)(ComponentBrowser)
