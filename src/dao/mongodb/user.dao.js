'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * User DAO.
 * @module user.dao
 */
class UserDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'user');
  }

  objectMapper(doc) {
    return {
      id:       doc._id,
      username: doc.username,
      date:     doc.date
    };
  }
}

module.exports = UserDao;

