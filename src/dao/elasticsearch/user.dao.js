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
        ip:       {type: 'string', store: 'yes', index: 'not_analyzed'},
        uid:      {type: 'string', store: 'yes', index: 'not_analyzed'},
        username: {type: 'string', store: 'yes', index: 'not_analyzed'},
        date    : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }

  /**
   * Find user by its UID.
   * @param {String} uid UID.
   * @return {Object} the user
   */
  findByUid (uid) {
    return this.find({uid: uid}, {size: 1}).then((users) => {
      const user = users.length ? users[0] : null
      return Promise.resolve(user)
    })
  }
}

module.exports = UserDao

