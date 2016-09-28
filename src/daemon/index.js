'use strict'

const cp = require('child_process')
const logger = require('../helper').logger

const EMBEDDED_DAEMONS = process.env.APP_EMBEDDED_DAEMONS

const embeddedDaemons = EMBEDDED_DAEMONS ? EMBEDDED_DAEMONS.split(',') : []

const daemonsRegistry = new Map()

/**
 * Embedded daemons.
 * @module daemon
 */
module.exports = {
  start: function () {
    for (let name of embeddedDaemons) {
      logger.debug('Starting %s embedded daemon...', name)
      const daemon = cp.fork(`${__dirname}/${name}.js`)
      daemonsRegistry.set(name, daemon)
    }
  },
  shutdown: function () {
    for (let name of daemonsRegistry.keys()) {
      logger.debug('Stoping  %s embedded daemon...', name)
      daemonsRegistry.get(name).kill()
    }
  }
}
