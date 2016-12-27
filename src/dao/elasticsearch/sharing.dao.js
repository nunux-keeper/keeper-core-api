'use strict'

const AbstractElasticsearchDao = require('./common/abstract.dao')

/**
 * Sharing DAO.
 * @module sharing.dao
 */
class SharingDao extends AbstractElasticsearchDao {
  constructor (client, index) {
    super(client, index, 'sharing')
  }

  getMapping () {
    return {
      properties: {
        owner: {type: 'string', store: 'yes', index: 'not_analyzed'},
        targetLabel: {type: 'string', store: 'yes', index: 'not_analyzed'},
        pub: {type: 'boolean', store: 'yes'},
        date : {type: 'date', store: 'yes', format: 'date_optional_time'},
        startDate : {type: 'date', store: 'yes', format: 'date_optional_time'},
        endDate : {type: 'date', store: 'yes', format: 'date_optional_time'}
      }
    }
  }
}

module.exports = SharingDao

