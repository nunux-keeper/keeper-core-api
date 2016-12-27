'use strict'

const hal = require('hal')
const monitoringService = require('../service').monitoring
const globals = require('../helper').globals
const urlConfig = require('../helper').urlConfig

module.exports = {
  /**
   * Get API informations.
   */
  get: function (req, res, next) {
    monitoringService.monitor()
    .then(function (ok) {
      const resource = new hal.Resource({
        name: globals.NAME,
        description: globals.DESCRIPTION,
        version: globals.VERSION,
        apiVersion: urlConfig.apiVersion.substring(1),
        env: globals.ENV
      }, urlConfig.baseUrl)
      resource.link('documentation', urlConfig.resolve('/api-docs/', true))
      resource.link('documentation.json', urlConfig.resolve('/api-docs.json', true))
      if (globals.AUTH_REALM) {
        resource.link('auth-realm', globals.AUTH_REALM)
      }
      res.status(ok ? 200 : 503).json(resource)
    }, next)
  }
}
