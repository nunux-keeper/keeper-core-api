'use strict'

const errors = require('../helper').errors
const clientService = require('../service').client

/**
 * Middleware to get client form path params.
 */
module.exports = function (req, res, next) {
  clientService.get(req.params.clientId)
  .then(client => {
    if (!client) {
      return next(new errors.NotFound('Client not found.'))
    }
    // Only allow to see own client.
    if (client.owner !== req.user.id) {
      return next(new errors.Forbidden())
    }

    if (!req.requestData) {
      req.requestData = {}
    }
    req.requestData.client = client
    next()
  }, next)
}
