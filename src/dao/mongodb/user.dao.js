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
}

module.exports = UserDao;

