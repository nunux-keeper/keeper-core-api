'use strict'

const hal = require('hal')
const urlConfig = require('../helper').urlConfig

/**
 * Add HAL data into the webhook.
 * @param {Object} webhook Webhook DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (webhook) {
  const resource = new hal.Resource(webhook, urlConfig.resolve(`/webhooks/${webhook.id}`))
  resource.link('all', urlConfig.resolve('/webhooks'))
  return Promise.resolve(resource)
}

module.exports = {
  /**
   * Decorate webhook DTO with HAL data.
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
