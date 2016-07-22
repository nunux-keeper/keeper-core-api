'use strict'

const AbstractMongodbDao = require('./common/abstract.dao')

/**
 * Label DAO.
 * @module label.dao
 */
class LabelDao extends AbstractMongodbDao {
  constructor (client, index) {
    super(client, index, 'label')
  }

  getMapping () {
    return {
      properties: {
        label: {type: 'string', store: 'yes', index: 'not_analyzed'},
        color: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner: {type: 'string', store: 'yes', index: 'not_analyzed'},
        ghost: {type: 'boolean', store: 'yes'},
        date : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }
}

module.exports = LabelDao

