'use strict';

const monitoringService = require('../service').monitoring;

module.exports = {
  /**
   * Monitor database status.
   */
  get: function(req, res, next) {
    monitoringService.monitor()
    .then(function(ok) {
      res.status(ok ? 200 : 503).json(req.appInfo);
    }, next);
  }
};
