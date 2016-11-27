'use strict'

const errors = require('../helper').errors
const decorator = require('../decorator')
const userService = require('../service').user

module.exports = {
  /**
   * Get current profile data.
   */
  get: function (req, res/*, next*/) {
    decorator.decorate(
      req.user,
      decorator.profile.privacy(),
      decorator.profile.hash(),
      decorator.profile.hal()
    )
    .then((resource) => {
      res.json(resource)
    })
  },

  /**
   * Update current profile data (public alias).
   */
  update: function (req, res, next) {
    req.sanitizeBody('alias').trim()
    req.checkBody('alias', 'Invalid alias').optional().isLength(4, 64)
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }
    const update = {
      alias: req.body.alias
    }

    userService.update(req.user, update)
    .then((user) => {
      return decorator.decorate(
        req.user,
        decorator.profile.privacy(),
        decorator.profile.hash(),
        decorator.profile.hal()
      )
    })
    .then(function (resource) {
      res.json(resource)
    }, next)
  }
}
