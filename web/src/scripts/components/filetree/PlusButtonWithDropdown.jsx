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

import NavigatorHeaderButton from './NavigatorHeaderButton'
import DropdownMenuButton from '../buttons/DropdownMenuButton'
import TwoStateButton from '../buttons/TwoStateButton'
import LandingButton from '../buttons/LandingButton'
import NewIcon from '../display/NewIcon'

export default ({
  node, scaffolds, createFileScaffold, onVisibilityChange, visible, menuType, captureBackground,
}) => {
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
                marginBottom: i === options.length - 1 ? 0 : 6,
                marginRight: 10,
                marginLeft: 10,
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
        hoverStyle={{ opacity: 0.75 }}
        enabledStyle={{ opacity: 0.5 }}>
        <div>
          <NavigatorHeaderButton
            buttonClass={'icon-plus'}
          />
        </div>
      </TwoStateButton>
    </DropdownMenuButton>
  )
}
