'use strict'

const url = require('url')
const logger = require('../helper').logger
const globals = require('../helper').globals

/**
 * Event broker client.
 * @module event-broker/client
 */
class EventBrokerClient {
  /**
   * Constructor.
   */
  constructor () {
    // Disable the client if the feature is not configured.
    this.disabled = !globals.EVENT_BROKER_URI
    if (this.disabled) {
      logger.debug('No event broker configured.')
      return
    }
    let providerName = url.parse(globals.EVENT_BROKER_URI).protocol.slice(0, -1)
    providerName = providerName.replace(/s$/, '')
    this.provider = require(`./${providerName}`)(globals.EVENT_BROKER_URI)
  }

  /**
   * Emit event.
   * @param {String} topic   Event topic
   * @param {Object} payload Event payload
   */
  emit (topic, payload) {
    if (this.disabled) {
      return
    }
    this.provider.emit(topic, payload)
  }
}

module.exports = new EventBrokerClient()
