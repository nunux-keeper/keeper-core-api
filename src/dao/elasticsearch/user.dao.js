'use strict';

const _      = require('lodash'),
      logger = require('../../helper').logger;

/**
 * Build elasticsearch query to find users.
 * @param {String} owner owner used to filter the query
 * @param {String} q query
 * @returns {Object} query DSL
 */
var buildQuery = function(query) {
  return {
    fields: ['username'],
    size: 100,
    sort: [
      '_score',
      { date: {order: query.order}}
    ],
    query: {
      filtered: {
        query: { match_all: {} },
      }
    }
  };
};

/**
 * User DAO.
 * @module user.dao
 */
function UserDao(client, index) {
  this.client = client;
  this.index = index;
  this.type = 'user';
  this.configured = false;
  this.mapping = {
    properties: {
      username: {type: 'string', store: 'yes', index: 'not_analyzed'},
      date:     {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
    }
  };

  this.client.indices.putMapping({
    index: this.index,
    type: this.type,
    body: this.mapping
  }).then(() => {
    this.configured = true;
    logger.debug('Elasticsearch user mapping configured.');
  }, (err) => {
    logger.error('Unable to configure elasticsearch user mapping.', err);
  });
}

/**
 * Get an user.
 * @param {String} id ID of the user.
 * @return {Object} the label
 */
UserDao.prototype.get = function(id) {
  return this.client.get({
    index: this.index,
    type: this.type,
    _source: true,
    id: id
  }).then((r) => {
    r._source.id = r._id;
    return Promise.resolve(r._source);
  });
};

/**
 * Search users.
 * @param {String} query Search query.
 * @return {Array} the users
 */
UserDao.prototype.find = function(query) {
  return this.client.search({
    index: this.index,
    type: this.type,
    body: buildQuery(query)
  }).then((data) => {
    const result = {};
    result.total = data.hits.total;
    result.hits = [];
    data.hits.hits.forEach(function(hit) {
      result.hits.push(_.assign({id: hit._id}, hit.fields));
    });
    return Promise.resolve(result);
  });
};

/**
 * Create an user.
 * @param {Object} user The user to create
 * @return {Object} the created user
 */
UserDao.prototype.create = function(user) {
  user = _.pick(user, ['id', 'username']);
  user.date = new Date();

  return this.client.create({
    index: this.index,
    type: this.type,
    id: user.id,
    body: user,
  }).then(function(r) {
    if (r.created) {
      return Promise.resolve(user);
    }
    return Promise.reject(r);
  });
};

/**
 * Update an user.
 * @param {Object} user User to update
 * @param {Object} update Update to apply
 * @return {Object} the updated user
 */
UserDao.prototype.update = function(user, update) {
  update = _.pick(update, ['username']);
  update.date = new Date();
  return this.client.update({
    index: this.index,
    type:  this.type,
    id: user.id,
    body: {
      doc: update
    },
    fields: '_source'
  }).then(function(r) {
    const result = r.get._source;
    result.id = r._id;
    return Promise.resolve(result);
  });

};

/**
 * Delete an user.
 * @param {Object} user The user to delete
 * @return {Object} the deleted user
 */
UserDao.prototype.remove = function(user) {
  return this.client.delete({
    index: this.index,
    type:  this.type,
    id: user.id
  }).then((/*r*/) => {
    return Promise.resolve(user);
  });
};

module.exports = UserDao;
