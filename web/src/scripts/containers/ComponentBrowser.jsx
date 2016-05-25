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

const style = {
  flex: '1 1 auto',
  display: 'flex',
  alignItems: 'stretch',
  backgroundColor: 'rgb(252,251,252)',
  overflow: 'hidden',
}

const innerStyle = {
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
}

const PANE_HEADER_HEIGHT = 32
const SEARCHBAR_HEIGHT = 38

class ComponentBrowser extends Component {
  render() {
    return (
      <div className={'project-navigator vbox ' + this.props.className}
        style={style}>
        <PaneHeader text={'Components'} />
        <div style={innerStyle}>
          <FilterableList
            items={this.props.componentList}
            onItemClick={() => {}}
            renderItem={(item, i) => {
              return (
                <DraggableComponentMenuItem
                  name={item.name}
                  author={item.publisher}
                  description={item.description}
                  badges={item.tags || []}
                  image={item.thumbnail}
                  index={i}
                  item={item} />
              )
            }}
            autoSelectFirst={false}
            width={this.props.width}
            innerStyle={{
              overflowY: 'auto',
              maxHeight: this.props.height - PANE_HEADER_HEIGHT - SEARCHBAR_HEIGHT,
              width: this.props.width,
            }} />
        </div>
      </div>
    )
  }
}

ComponentBrowser.defaultProps = {
  className: '',
  style: {},
}

const mapStateToProps = (state) => {
  return {
    componentList: state.modules.modules,
  }
}

export default connect(mapStateToProps)(ComponentBrowser)
