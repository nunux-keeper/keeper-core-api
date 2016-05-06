'use strict'

/**
 * Monitoring services.
 * @module monitoring.service
 */
const MonitoringService = {}

MonitoringService.monitor = function () {
  return Promise.resolve(true)
}

module.exports = MonitoringService

