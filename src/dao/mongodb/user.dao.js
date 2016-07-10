'use strict'

const AbstractMongodbDao = require('./abstract')
// const logger = require('../../helper').logger

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
    logger.debug('findByUid::uid', uid)
    return this.getCollection().then((collection) => {
      logger.debug('findByUid::collection')
      return collection.find({uid: uid}).limit(1).toArray().then((users) => {
        logger.debug('findByUid::users', users)
        const user = users.length ? this.objectMapper(users[0]) : null
        logger.debug('findByUid::user', user)
        return Promise.resolve(user)
      })
    })
  }
}

module.exports = UserDao

