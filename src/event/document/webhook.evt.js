'use strict'

const _ = require('lodash')
const request = require('request')
const crypto = require('crypto')
const webhookDao = require('../../dao').webhook
const logger = require('../../helper').logger
const urlConfig = require('../../helper').urlConfig
const metrics = require('../../metrics/client')

/**
 * Trigger for a webhook
 * @param {String} event Event name
 * @param {Object} webhook the webhook
 * @param {Object} doc the documenet to send as payload
 */
const triggerWebhook = function (event, webhook, doc) {
  const _doc = _.pick(doc, ['id', 'title', 'labels', 'origin', 'date'])
  const payload = {
    action: `${event}_document`,
    issue: {
      url: urlConfig.baseUrl,
      date: new Date()
    },
    document: _doc
  }
  let headers = {
    'User-Agent': 'Keeper-Hookshot'
  }
  if (webhook.secret) {
    headers['X-Hub-Signature'] = crypto.createHmac('sha1', webhook.secret)
      .update(JSON.stringify(payload)).digest('hex')
  }

  logger.debug(`Sending payload to Webhook ${webhook.url} ...`, payload)
  const t0 = new Date()
  request({
    url: webhook.url,
    method: 'POST',
    json: payload,
    headers
  }, function (err, res, body) {
    const t1 = new Date()
    let sts = 'ok'
    if (err || res.statusCode > 299) {
      sts = 'ko'
      logger.error('Unable to send payload the Webhook', err || body)
    } else {
      logger.debug(`Payload sent to Webhook ${webhook.url}`, payload)
    }
    metrics.timing(`webhook_call,owner=${webhook.owner},id=${webhook.id},status=${sts}`, t1 - t0)
  })
}

/**
 * Trigger for all webhooks matching an document and en event
 * @param {Object} event Event to filter webhooks
 * @param {Object} doc   Document to filter webhooks and to send as payload
 */
const triggerWebhooks = function (event, doc) {
  const query = {
    owner: doc.owner,
    active: true,
    events: event
  }
  if (doc.labels) {
    query.labels = doc.labels
  }

  webhookDao.find(query, {order: 'asc', from: 0, size: 100})
    .then(
      results => results.forEach(webhook => triggerWebhook(event, webhook, doc)),
      err => logger.error('Error while processing webhook', err)
    )
}

/**
 * Document event handler.
 */
module.exports = function (documentEventHandler) {
  documentEventHandler.on('create', doc => triggerWebhooks('create', doc))
  documentEventHandler.on('update', doc => triggerWebhooks('update', doc))
  documentEventHandler.on('remove', doc => triggerWebhooks('remove', doc))
}
