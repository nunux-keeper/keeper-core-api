'use strict'

const AbstractElasticsearchDao = require('./common/abstract.dao')

/**
 * User DAO.
 * @module user.dao
 */
class UserDao extends AbstractElasticsearchDao {
  constructor (client, index) {
    super(client, index, 'user')
  }

  getMapping () {
    return {
      properties: {
        ip:            {type: 'string', store: 'yes', index: 'not_analyzed'},
        uid:           {type: 'string', store: 'yes', index: 'not_analyzed'},
        apiKey:        {type: 'string', store: 'yes', index: 'not_analyzed'},
        name:          {type: 'string', store: 'yes', index: 'not_analyzed'},
        email:         {type: 'string', store: 'yes', index: 'not_analyzed'},
        exportRequest: {type: 'integer', store: 'yes', index: 'not_analyzed'},
        date:          {type: 'date', store: 'yes', format: 'date_optional_time'}
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

  /**
   * Find user by its API key.
   * @param {String} key API key.
   * @return {Object} the user
   */
  findByApiKey (key) {
    return this.find({apiKey: key}, {size: 1}).then((users) => {
      const user = users.length ? users[0] : null
      return Promise.resolve(user)
    })
  }
}

module.exports = UserDao

