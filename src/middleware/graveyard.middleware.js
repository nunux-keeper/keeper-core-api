'use strict'

/**
 * Middleware to to add ghost param to the query.
 */
module.exports = {
  ghost: function (req, res, next) {
    if (!req.query) {
      req.query = {}
    }
    req.query.ghost = true
    return next()
  }
}
