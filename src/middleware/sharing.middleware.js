'use strict'

const errors = require('../helper').errors
const sharingService = require('../service').sharing
const labelService = require('../service').label

module.exports = {
  /**
   * Middleware to assert that the sharing is public.
   */
  assertPublic: function (req, res, next) {
    if (!req.requestData.sharing || !req.requestData.sharing.pub) {
      return next(new errors.NotFound('Sharing not public.'))
    }
    return next()
  },

  /**
   * Middleware to get sharing object form path params.
   */
  get: function (req, res, next) {
    sharingService.get(req.params.sid)
    .then(function (sharing) {
      if (!sharing) {
        return next(new errors.NotFound('Sharing not found.'))
      }
      // Check that the sharing can be accessed
      if (!sharing.pub && !req.user) {
        return next(new errors.Unauthorized())
      }

      // Check that the sharing is available in the current time frame
      if (sharing.startDate > Date.now() || (sharing.endDate && sharing.endDate < Date.now())) {
        return next(new errors.NotFound('Sharing not available.'))
      }

      if (!req.requestData) {
        req.requestData = {}
      }
      req.requestData.sharing = sharing
      return labelService.get(sharing.targetLabel)
    })
    .then(function (label) {
      if (!label) {
        return next(new errors.NotFound('Target label not found.'))
      }
      // Only allow to see a non ghost label.
      if (label.ghost) {
        return next(new errors.NotFound('Target label not existing anymore.'))
      }
      const sharing = req.requestData.sharing
      if (label.sharing !== sharing.id) {
        return next(new errors.InternalError('Target label don\'t match.'))
      }
      req.requestData.label = label
      next()
    }, next)
  },

  /**
   * Middleware to get sharing object form path params.
   */
  getFromLabel: function (req, res, next) {
    if (!req.requestData || !req.requestData.label) {
      return next(new errors.BadRequest('Missing label.'))
    }
    const label = req.requestData.label
    if (!label.sharing) {
      return next(new errors.NotFound('Sharing not found.'))
    }
    sharingService.get(label.sharing)
    .then(function (sharing) {
      if (!sharing) {
        return next(new errors.NotFound('Sharing not found.'))
      }
      if (sharing.owner !== req.user.id) {
        // Only allow to see own sharing.
        return next(new errors.Forbidden())
      }
      if (label.sharing !== sharing.id) {
        return next(new errors.InternalError('Target label don\'t match.'))
      }

      req.requestData.sharing = sharing
      next()
    }, next)
  }
}
