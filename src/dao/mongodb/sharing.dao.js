'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * Sharing DAO.
 * @module sharng.dao
 */
class SharingDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'sharing')
  }
}

module.exports = SharingDao
