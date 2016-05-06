'use strict'

const logger = require('../helper').logger
const path = require('path')

/**
 * API.
 */
module.exports = function (app, server, passport) {
  // Dynamic loading API...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z]+\.api\.js$/.test(file)) {
      const name = path.basename(file, '.api.js')
      logger.debug('Loading %s API...', name)
      require(path.join(__dirname, file))(app, server, passport)
    }
  })
}
