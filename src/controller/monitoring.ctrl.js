'use strict'

const monitoringService = require('../service').monitoring
const globals = require('../helper').globals

module.exports = {
  /**
   * Monitor database status.
   */
  get: function (req, res, next) {
    monitoringService.monitor()
    .then(function (ok) {
      res.status(ok ? 200 : 503).json({
        name: globals.NAME,
        description: globals.DESCRIPTION,
        version: globals.VERSION,
        env: globals.ENV,
        realm: globals.REALM
      })
    }, next)
  }
}
