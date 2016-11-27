'use strict'

const errors = require('../helper').errors
const labelService = require('../service').label

/**
 * Middleware to get label form path params.
 */
module.exports = function (req, res, next) {
  labelService.get(req.params.labelId)
  .then(function (label) {
    if (!label) {
      return next(new errors.NotFound('Label not found.'))
    }
    // Only allow to see own label.
    if (label.owner !== req.user.id) {
      return next(new errors.Forbidden())
    }

    if (!req.requestData) {
      req.requestData = {}
    }
    req.requestData.label = label
    next()
  }, next)
}
