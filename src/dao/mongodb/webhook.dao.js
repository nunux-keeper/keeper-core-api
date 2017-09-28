'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * Webhook DAO.
 * @module webhook.dao
 */
class WebhookDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'webhook')
  }
}

module.exports = WebhookDao
