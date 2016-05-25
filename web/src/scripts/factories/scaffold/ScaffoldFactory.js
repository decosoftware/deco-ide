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

import _ from 'lodash'

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

// https://webpack.github.io/docs/context.html#context-module-api
const templates = requireAll(require.context("./ReactNativeScaffolds/", false, /.json$/))
const coreSubFactories = _.keyBy(templates, 'name')

const coreItems = _.map(templates, (template) => {
  return {
    name: template.name,
    module: template.parentModule,
  }
})

class ScaffoldFactory {
  static items() {
    return coreItems
  }

  static makeCoreComponents() {
    let coreComponents = {}
    _.each(coreItems, (coreItem) => {
      coreComponents[coreItem.name] = coreSubFactories[coreItem.name]
    })
    return coreComponents
  }
}

export default ScaffoldFactory
