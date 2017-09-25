'use strict'

const crypto = require('crypto')
const errors = require('../helper').errors
const logger = require('../helper').logger
const decorator = require('../decorator')
const userService = require('../service').user

module.exports = {
  /**
   * Get current profile data.
   */
  get: function (req, res/*, next*/) {
    req.sanitizeQuery('withStats').toBoolean()
    const decorators = [
      decorator.profile.privacy(),
      decorator.profile.hash(),
      decorator.profile.hal()
    ]
    if (req.query.withStats) {
      decorators.push(decorator.profile.stats())
    }
    decorator.decorate(
      req.user,
      ...decorators
    )
    .then((resource) => {
      res.json(resource)
    })
  },

  /**
   * Update current profile data.
   */
  update: function (req, res, next) {
    req.sanitizeBody('resetApiKey').toBoolean()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const update = {}

    if (req.body.resetApiKey) {
      logger.info('Reset user API key: %j', req.user.uid)
      update.apiKey = crypto.randomBytes(20).toString('hex')
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
      if (req.body.resetApiKey) {
        resource.apiKey = update.apiKey
      }
      res.json(resource)
    }, next)
  }
}
