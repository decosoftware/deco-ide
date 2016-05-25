'use strict'
const blacklist = require('react-native/packager/blacklist')

var ignoreFBJS = [
  /{root folder name}\/node_modules\/.+\/node_modules\/fbjs\/.*/
]

module.exports = {
  getBlacklistRE() {
    return blacklist('', ignoreFBJS)
  },
}