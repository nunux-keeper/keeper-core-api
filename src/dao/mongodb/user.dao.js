'use strict'

const AbstractMongodbDao = require('./abstract')
const _ = require('lodash')

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
      return collection.find({uid: uid}).limit(1).toArray().then((users) => {
        return Promise.resolve(_.map(users, this.objectMapper))
      })
    })
  }
}

module.exports = UserDao

