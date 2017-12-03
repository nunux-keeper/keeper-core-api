'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * Client DAO.
 * @module client.dao
 */
class ClientDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'client')
  }
}

module.exports = ClientDao
