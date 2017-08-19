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

  configure () {
    // Creating unique constraint for UID attribute...
    return this.getCollection().then((collection) => {
      logger.debug('Configuring collection: %s ...', this.collection)
      return collection.createIndex({uid:1}, {unique: true})
    })
  }

  /**
   * Find user by its UID.
   * @param {String} uid UID.
   * @return {Object} the user
   */
  findByUid (uid) {
    return this.getCollection().then((collection) => {
      return collection.findOne({uid: uid}).then((user) => {
        // logger.debug('findByUid::user', user)
        return Promise.resolve(this.objectMapper(user))
      })
    })
  }

  /**
   * Find user by its API key.
   * @param {String} key API key.
   * @return {Object} the user
   */
  findByApiKey (key) {
    return this.getCollection().then((collection) => {
      return collection.findOne({apiKey: key}).then((user) => {
        // logger.debug('findByApiKey::key', key)
        return Promise.resolve(this.objectMapper(user))
      })
    })
  }
}

module.exports = UserDao

