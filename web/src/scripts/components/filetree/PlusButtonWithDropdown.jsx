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
import { StylesEnhancer } from 'react-styles-provider'

import NavigatorHeaderButton from './NavigatorHeaderButton'
import DropdownMenuButton from '../buttons/DropdownMenuButton'
import TwoStateButton from '../buttons/TwoStateButton'
import LandingButton from '../buttons/LandingButton'
import NewIcon from '../display/NewIcon'

const stylesCreator = ({colors}) => ({
  plusIcon: {
    marginRight: 10,
    height: 12,
    width: 12,
    WebkitMaskPosition: 'center',
    WebkitMaskImage: `-webkit-image-set(
      url('./icons/icon-plus.png') 1x,
      url('./icons/icon-plus@2x.png') 2x
    )`,
    backgroundColor: colors.fileTree.icon,
  },
  option: {
    marginRight: 10,
    marginLeft: 10,
  },
  hoveredButton: {
    opacity: 0.75,
  },
  enabledButton: {
    opacity: 0.5,
  },
})

@StylesEnhancer(stylesCreator)
export default class PlusButtonWithDropdown extends Component {
  render() {
    const {
      captureBackground,
      createFileScaffold,
      menuType,
      node,
      onVisibilityChange,
      scaffolds,
      styles,
      visible,
    } = this.props

    const scaffoldOptions = scaffolds.map(({name, id}) => {
      return {
        text: `New ${name}`,
        action: () => createFileScaffold(node, id),
      }
    })

    const options = [
      { text: 'New File', action: () => createFileScaffold(node) },
      ...scaffoldOptions,
    ]

    return (
      <DropdownMenuButton
        menuType={menuType}
        captureBackground={captureBackground}
        onVisibilityChange={onVisibilityChange}
        renderContent={() =>
          <div className={'helvetica-smooth'}>
            {_.map(options, ({text, action}, i) => (
              <div key={i}
                style={{
                  ...styles.option,
                  marginBottom: i === options.length - 1 ? 0 : 6,
                }}>
                <LandingButton
                  align={'flex-start'}
                  onClick={action}>
                  <NewIcon />
                  {text}
                </LandingButton>
              </div>
            ))}
          </div>
        }>
        <TwoStateButton
          enabled={visible}
          hoverStyle={styles.hoveredButton}
          enabledStyle={styles.enabledButton}>
          <div>
            <div style={styles.plusIcon}/>
          </div>
        </TwoStateButton>
      </DropdownMenuButton>
    )
  }
}
