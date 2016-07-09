'use strict'

const errors = require('../helper').errors

/**
 * Middleware to protect admin resources.
 */
module.exports = {
  isAdmin: function (req, res, next) {
    if (!req.user.admin) {
      return next(new errors.Forbidden())
    }
    return next()
  }
}
