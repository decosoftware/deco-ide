process.env.NODE_ENV = 'test'

// Register babel so that it will transpile ES6 to ES5
// before our tests run.
require('babel-register')()

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
