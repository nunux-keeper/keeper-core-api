'use strict'

const logger = require('../helper').logger
const path = require('path')

// Dynamic loading storage driver...
const STORAGE_DRIVER = process.env.APP_STORAGE
let driver = null
require('fs').readdirSync(__dirname).forEach(function (file) {
  if (file === `${STORAGE_DRIVER}.storage.js`) {
    logger.debug('Loading %s storage driver...', STORAGE_DRIVER)
    driver = require(path.join(__dirname, file))
  }
})

if (!driver) {
  logger.debug('Storage driver not found. Using local...')
  driver = require('./local.storage.js')
}

module.exports = driver
