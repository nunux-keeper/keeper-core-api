'use strict'

const url = require('url')
const logger = require('../helper').logger
const globals = require('../helper').globals

const PREFIX = 'keeper'

/**
 * Stats server client.
 * @module stats/client
 */
class StatsServerClient {
  /**
   * Constructor.
   */
  constructor () {
    // Disable the event handler if the search feature is not delegated.
    this.disabled = !globals.STATS_SERVER_URI
    if (this.disabled) {
      logger.debug('No metric provider configured.')
      return
    }
    const providerName = url.parse(globals.STATS_SERVER_URI).protocol.slice(0, -1)
    this.provider = require(`./${providerName}`)(globals.STATS_SERVER_URI)
  }

  /**
   * Increment a metric.
   * @param {String} name Metric name
   */
  increment (name) {
    if (this.disabled) {
      return
    }
    this.provider.increment(`${PREFIX}_${name}`)
  }

  /**
   * Set a metric.
   * @param {String} name Metric name
   * @param {Integer} value Metric value
   */
  set (name, value) {
    if (this.disabled) {
      return
    }
    this.provider.set(`${PREFIX}_${name}`, value)
  }

  /**
   * Set a gauge.
   * @param {String} name Gauge name
   * @param {Integer} value Gauge value
   */
  gauge (name, value) {
    if (this.disabled) {
      return
    }
    this.provider.gauge(`${PREFIX}_${name}`, value)
  }

  /**
   * Mesure timing.
   * @param {String} name Timer name
   * @param {Integer} value Timer value
   */
  timing (name, value) {
    if (this.disabled) {
      return
    }
    this.provider.timing(`${PREFIX}_${name}`, value)
  }
}

module.exports = new StatsServerClient()
