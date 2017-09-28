'use strict'

const errors = require('../helper').errors
const webhookService = require('../service').webhook

/**
 * Middleware to get webhook form path params.
 */
module.exports = function (req, res, next) {
  webhookService.get(req.params.webhookId)
  .then(webhook => {
    if (!webhook) {
      return next(new errors.NotFound('Webhook not found.'))
    }
    // Only allow to see own webhook.
    if (webhook.owner !== req.user.id) {
      return next(new errors.Forbidden())
    }

    if (!req.requestData) {
      req.requestData = {}
    }
    req.requestData.webhook = webhook
    next()
  }, next)
}
