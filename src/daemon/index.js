'use strict'

const cp = require('child_process')
const logger = require('../helper').logger

const EMBEDDED_DAEMONS = process.env.APP_EMBEDDED_DAEMONS

const embedded_daemons = EMBEDDED_DAEMONS ? EMBEDDED_DAEMONS.split(',') : []

const daemons_registry = new Map()

/**
 * Embedded daemons.
 * @module daemon
 */
module.exports = {
  start: function () {
    for (let name of embedded_daemons) {
      logger.debug('Starting %s embedded daemon...', name)
      const daemon = cp.fork(`${__dirname}/${name}.js`)
      daemons_registry.set(name, daemon)
    }
  },
  shutdown: function () {
    for (let name of daemons_registry.keys()) {
      logger.debug('Stoping  %s embedded daemon...', name)
      daemons_registry.get(name).kill()
    }
  }
}
