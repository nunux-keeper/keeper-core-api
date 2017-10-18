'use strict'

const _ = require('lodash')
const hal = require('hal')
const errors = require('../helper').errors
const urlConfig = require('../helper').urlConfig
const webhookService = require('../service').webhook
const decorator = require('../decorator')
const validator = require('validator')

const webhookSchema = {
  'url': {
    optional: false,
    isURL: {}
  },
  'secret': {
    optional: true
  },
  'active': {
    optional: true,
    isBoolean: {}
  }
}

/**
 * Controller to manage webhooks.
 * @module webhook.ctrl
 */
module.exports = {
  /**
   * Get webhook details.
   */
  get: function (req, res, next) {
    decorator.decorate(
      req.requestData.webhook,
      decorator.webhook.hal()
    )
    .then(function (resource) {
      res.json(resource)
    }, next)
  },

  /**
   * Search user's webhooks.
   */
  search: function (req, res, next) {
    req.sanitizeQuery('active').toBoolean()
    req.checkQuery('label', 'Invalid label param').optional().isAlphanumeric()
    req.checkQuery('event', 'Invalid event param').optional().isAlphanumeric()
    req.checkQuery('active', 'Invalid active param').optional().isBoolean()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const query = _.pick(req.query, ['label', 'event', 'active'])
    webhookService.search(req.user.id, query, [decorator.webhook.hal()])
    .then(function (webhooks) {
      const resource = new hal.Resource({webhooks}, urlConfig.resolve('/webhooks'))
      resource.link('get', {href: urlConfig.resolve('/webhooks/{id}'), templated: true})
      res.json(resource)
    }, next)
  },

  /**
   * Create new webhook.
   */
  create: function (req, res, next) {
    req.sanitizeBody('secret').trim()
    req.sanitizeBody('active').toBoolean()
    req.checkBody(webhookSchema)
    req.checkBody('labels', 'Invalid label filter (should be a label ID)').optional().isArrayOf(validator.isHexadecimal)
    req.checkBody('events', 'Invalid event filter (should be create, update or remove)').optional().isArrayOf(item => {
      return validator.isIn(item, ['create', 'update', 'remove'])
    })
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const newWebhook = _.pick(req.body, ['url', 'secret', 'active', 'events', 'labels'])
    newWebhook.owner = req.user.id
    webhookService.create(newWebhook)
    .then(function (webhook) {
      return decorator.decorate(
        webhook,
        decorator.webhook.hal()
      )
    })
    .then(function (resource) {
      res.status(201).json(resource)
    }, next)
  },

  /**
   * Put webhook modification.
   */
  update: function (req, res, next) {
    req.sanitizeBody('secret').trim()
    req.sanitizeBody('active').toBoolean()
    req.checkBody(webhookSchema)
    req.checkBody('labels', 'Invalid label filter (should be a label ID)').optional().isArrayOf(validator.isHexadecimal)
    req.checkBody('events', 'Invalid event filter (should be create, update or delete)').optional().isArrayOf(item => {
      return validator.isIn(item, ['create', 'update', 'delete'])
    })
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const update = _.pick(req.body, ['url', 'secret', 'active', 'events', 'labels'])
    webhookService.update(req.requestData.webhook, update)
    .then(function (webhook) {
      return decorator.decorate(
        webhook,
        decorator.webhook.hal()
      )
    })
    .then(function (resource) {
      res.status(200).json(resource)
    }, next)
  },

  /**
   * Delete a webhook.
   */
  del: function (req, res, next) {
    const webhook = req.requestData.webhook
    webhookService.remove(webhook)
    .then(function () {
      res.status(205).json()
    }, next)
  }
}
