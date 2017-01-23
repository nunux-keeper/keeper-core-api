'use strict'

const path = require('path')
const logger = require('../helper').logger
const daos = require('../dao')
const searchengine = require('../dao/searchengine')

// Dynamic loading services...
const services = {}
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.service\.js$/.test(file)) {
    const name = path.basename(file, '.service.js')
    logger.debug('Loading %s service...', name)
    services[name] = require(path.join(__dirname, file))
  }
})

/**
 * Shutdown services.
 * @return {Promise} shudtdown promise
 */
services.shutdown = function () {
  // Shutdown DAOs and Job queue...
  return daos.shutdown()
    .then(() => this.job.shutdown())
}

/**
 * Whait until the services are available.
 * @return {Promise} readyness promise
 */
services.isReady = function () {
  return daos.isReady().then(() => searchengine.isReady())
}

module.exports = services
