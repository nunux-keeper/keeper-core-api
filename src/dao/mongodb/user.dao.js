'use strict'

const AbstractMongodbDao = require('./abstract')
const logger = require('../../helper').logger

/**
 * User DAO.
 * @module user.dao
 */
class UserDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'user')
  }

  /**
   * Find user by its UID.
   * @param {String} uid UID.
   * @return {Object} the user
   */
  findByUid (uid) {
    return this.getCollection().then((collection) => {
      return collection.findOne({uid: uid}).then((user) => {
        logger.debug('findByUid::user', user)
        return Promise.resolve(this.objectMapper(user))
      })
    })
  }
}

module.exports = UserDao

