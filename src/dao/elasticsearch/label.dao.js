'use strict'

const AbstractMongodbDao = require('./abstract')

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
        date : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }
}

module.exports = LabelDao

