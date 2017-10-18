'use strict'

const metrics = require('../../metrics/client')

/**
 * Webhook event handler.
 */
module.exports = function (webhookEventHandler) {
  // Exit if disabled...
  if (metrics.disabled) {
    return
  }

  webhookEventHandler.on('create', (webhook) => {
    metrics.increment(`webhook_event,action=create,owner=${webhook.owner},id=${webhook.id}`)
  })

  webhookEventHandler.on('update', (webhook) => {
    metrics.increment(`webhook_event,action=update,owner=${webhook.owner},id=${webhook.id}`)
  })

  webhookEventHandler.on('remove', (webhook) => {
    metrics.increment(`webhook_event,action=remove,owner=${webhook.owner},id=${webhook.id}`)
  })
}
