'use strict'

const AbstractElasticsearchDao = require('./common/abstract.dao')

/**
 * Label DAO.
 * @module label.dao
 */
class LabelDao extends AbstractElasticsearchDao {
  constructor (client, index) {
    super(client, index, 'label')
  }

  getMapping () {
    return {
      properties: {
        label   : {type: 'string', store: 'yes', index: 'not_analyzed'},
        color   : {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner   : {type: 'string', store: 'yes', index: 'not_analyzed'},
        ghost   : {type: 'boolean', store: 'yes'},
        sharing : {type: 'string', store: 'yes', index: 'not_analyzed'},
        date    : {type: 'date', store: 'yes', format: 'date_optional_time'}
      }
    }
  }
}

module.exports = LabelDao

