'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const webhookDao = require('../dao').webhook
const decorator = require('../decorator')
const eventHandler = require('../event')

/**
 * Webhook services.
 * @module webhook.service
 */
const WebhookService = {}

/**
 * Get a Webhook.
 * @param {String} id ID of the webhook
 * @return {Object} the webhook
 */
WebhookService.get = function (id) {
  return webhookDao.get(id)
}

/**
 * iSearch webhooks of an user.
 * @param {String} owner Owner of the webhooks
 * @param {String} query Search query
 * @param {Function[]} decorators Decorators to apply
 * @return {Array} the webhooks
 */
WebhookService.search = function (owner, query, decorators) {
  const _query = {owner}
  if (query.label) {
    _query.labels = query.label
  }
  if (query.event) {
    _query.events = query.event
  }
  if (query.hasOwnProperty('active')) {
    _query.active = query.active
  }
  return webhookDao.find(_query, {
    order: 'asc', from: 0, size: 256
  }).then(result => {
    if (result.hits) {
      return Promise.all(result.hits.map((doc) => decorator.decorate(doc, ...decorators)))
        .then(webhooks => Promise.resolve({webhooks}))
    } else {
      return Promise.resolve(result)
    }
  })
}

/**
 * Count webhook.
 * @param {String} owner Owner of the webhooks
 * @return {Object} the number of webhooks
 */
WebhookService.count = function (owner) {
  return webhookDao.count(owner ? {owner} : {})
}

/**
 * Create a webhook.
 * @param {Object} webhook webhook to create
 * @return {Object} the created webhook
 */
WebhookService.create = function (webhook) {
  const { url, secret = '', events = [], labels = [], active = true, owner } = webhook
  return webhookDao.create({
    url, secret, events, labels, active, owner, cdate: new Date(), mdate: new Date()
  }).then(_webhook => {
    logger.info('Webhook created: %j', _webhook)
    eventHandler.webhook.emit('create', _webhook)
    return Promise.resolve(_webhook)
  })
}

/**
 * Update a webhook.
 * @param {Object} webhook  Webhook to update
 * @param {Object} update Update to apply
 * @return {Object} the updated webhook
 */
WebhookService.update = function (webhook, update) {
  const _update = _.pick(update, ['url', 'secret', 'events', 'labels', 'active'])
  _update.mdate = new Date()
  logger.debug('Updating webhook: %j', _update)
  return webhookDao.update(webhook, _update)
    .then(_webhook => {
      logger.info('Webhook updated: %j', _webhook)
      eventHandler.webhook.emit('update', _webhook)
      return Promise.resolve(_webhook)
    })
}

/**
 * Remove a webhook.
 * @param {Object} webhook Webhook to delete
 * @return {Object} the deleted webhook (it's ghost)
 */
WebhookService.remove = function (webhook) {
  return webhookDao.remove(webhook)
  .then(() => {
    logger.info('Webhook removed: %j', webhook)
    eventHandler.webhook.emit('remove', webhook)
    return Promise.resolve(webhook)
  })
}

module.exports = WebhookService
