'use strict'

const logger = require('../helper').logger
const path = require('path')

// Dynamic loading middlewares...
const middlewares = {}
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.middleware\.js$/.test(file)) {
    const name = path.basename(file, '.middleware.js')
    logger.debug('Loading %s middleware...', name)
    middlewares[name] = require(path.join(__dirname, file))
  }
})

module.exports = middlewares
