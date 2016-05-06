'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * User DAO.
 * @module user.dao
 */
class UserDao extends AbstractMongodbDao {
  constructor (client, index) {
    super(client, index, 'user')
  }

  getMapping () {
    return {
      properties: {
        username: {type: 'string', store: 'yes', index: 'not_analyzed'},
        date    : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }
}

module.exports = UserDao

