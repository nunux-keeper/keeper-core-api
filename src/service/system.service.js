'use strict'

const daos = require('../dao')
const searchengine = require('../dao/searchengine')

/**
 * System services.
 * @module system.service
 */
const SystemService = {}

/**
 * Shutdown services.
 * @return {Promise} shudtdown promise
 */
SystemService.shutdown = function () {
  return daos.shutdown()
}

/**
 * Whait until the services are available.
 * @return {Promise} readyness promise
 */
SystemService.isReady = function () {
  return daos.isReady().then(() => searchengine.isReady())
}

module.exports = SystemService

