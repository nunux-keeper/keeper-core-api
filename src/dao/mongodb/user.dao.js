'use strict'

const AbstractMongodbDao = require('./abstract')

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
        const user = users.length ? this.objectMapper(users[0]) : null
        return Promise.resolve(user)
      })
    })
  }
}

module.exports = UserDao

