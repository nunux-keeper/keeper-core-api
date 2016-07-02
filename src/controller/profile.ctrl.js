'use strict'

const hal = require('hal')
const errors = require('../helper').errors
const userService = require('../service').user

module.exports = {
  /**
   * Get current profile data.
   */
  get: function (req, res/*, next*/) {
    return res.json(req.user)
  },

  /**
   * Update current profile data (public alias).
   */
  update: function (req, res, next) {
    req.sanitizeBody('publicAlias').trim()
    req.checkBody('publicAlias', 'Invalid alias').optional().isLength(4, 64)
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }
    const update = {
      publicAlias: req.body.publicAlias
    }

    userService.update(req.user, update)
    .then(function (user) {
      const resource = new hal.Resource(user, req.url)
      res.json(resource)
    }, next)
  }
}
