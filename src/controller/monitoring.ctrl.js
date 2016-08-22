'use strict'

const hal = require('hal')
const monitoringService = require('../service').monitoring
const globals = require('../helper').globals

module.exports = {
  /**
   * Monitor database status.
   */
  get: function (req, res, next) {
    monitoringService.monitor()
    .then(function (ok) {
      const resource = new hal.Resource({
        name: globals.NAME,
        description: globals.DESCRIPTION,
        version: globals.VERSION,
        apiVersion: '2',
        env: globals.ENV
      }, globals.REALM)
      resource.link('documentation', globals.REALM + '/doc/')
      resource.link('auth-realm', globals.AUTH_REALM)
      res.status(ok ? 200 : 503).json(resource)
    }, next)
  }
}
