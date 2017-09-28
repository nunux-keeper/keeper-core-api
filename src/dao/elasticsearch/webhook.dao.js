'use strict'

const AbstractElasticsearchDao = require('./common/abstract.dao')

/**
 * Webhook DAO.
 * @module webhook.dao
 */
class WebhookDao extends AbstractElasticsearchDao {
  constructor (client, index) {
    super(client, index, 'webhook')
  }

  getMapping () {
    return {
      properties: {
        url    : {type: 'string', store: 'yes', index: 'not_analyzed'},
        secret : {type: 'string', store: 'yes', index: 'not_analyzed'},
        events : {type: 'string', store: 'yes', index: 'not_analyzed'},
        labels : {type: 'string', store: 'yes', index: 'not_analyzed'},
        active : {type: 'boolean', store: 'yes'},
        owner  : {type: 'string', store: 'yes', index: 'not_analyzed'},
        cdate  : {type: 'date', store: 'yes', format: 'date_optional_time'},
        mdate  : {type: 'date', store: 'yes', format: 'date_optional_time'}
      }
    }
  }
}

module.exports = WebhookDao

