'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * Label DAO.
 * @module label.dao
 */
class LabelDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'label')
  }
}

module.exports = LabelDao
