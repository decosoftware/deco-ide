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
import path from 'path'

// https://webpack.github.io/docs/context.html#context-module-api
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
const context = require.context("./ComponentScaffolds/", false, /.js$/)

// {name, generate({name}) => text}
const scaffolds = _.map(requireAll(context), (scaffold, i) => {
  return {
    ...scaffold,
    id: i,
  }
})

const scaffoldMetadata = _.map(scaffolds, ({name, id}) => {
  return {name, id}
})

const scaffoldsById = _.keyBy(scaffolds, 'id')

export default {

  /**
   * Returns an array of {name, id}
   * @return {Object[]}
   */
  getScaffolds: () => scaffoldMetadata,

  /**
   * Generates a scaffold from a scaffold id and params
   * @param  {Number} id
   * @param  {Object} params
   * @return {string}        Scaffold text
   */
  generateScaffold: (id, params) => {
    const scaffold = scaffoldsById[id]

    const {filename = ''} = params
    const basename = path.basename(filename, path.extname(filename))
    const name = _.upperFirst(_.camelCase(basename))

    return scaffold.generate({
      ...params,
      name,
    })
  },

  /**
   * Automatically add extension to filename if omitted
   * @param  {Number} id
   * @param  {String} filename
   * @return {String}          New filename
   */
  updateFilename: (id, filename) => {
    const scaffold = scaffoldsById[id]

    if (scaffold.extname && path.extname(filename) === '') {
      return filename + scaffold.extname
    } else {
      return filename
    }
  },
}
