'use strict'

const logger = require('../helper').logger

const EMBEDDED_DAEMONS = process.env.APP_EMBEDDED_DAEMONS

const daemons = EMBEDDED_DAEMONS ? EMBEDDED_DAEMONS.split(',') : []

/**
 * Embedded daemons.
 * @module daemon
 */
module.exports = {
  start: function () {
    for (let daemon of daemons) {
      logger.debug('Loading %s embedded daemon...', daemon)
      require(`./${daemon}.js`).start()
    }
  },
  shutdown: function () {
    for (let daemon of daemons) {
      require(`./${daemon}.js`).stop()
    }
  }
}
