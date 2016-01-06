'use strict';

const _ = require('lodash');

/**
 * User DAO.
 * @module user.dao
 */
function UserDao(client) {
  this.client = client;
  this.collection = () => {
    return this.client.then((db) => {
      return Promise.resolve(db.collection('user'));
    });
  };

  this.objectMapper = function(doc) {
    return {
      _id:      doc._id,
      id:       doc.uid,
      username: doc.username,
      date:     doc.date
    };
  };
}

/**
 * Get an user.
 * @param {String} id ID of the user.
 * @return {Object} the user
 */
UserDao.prototype.get = function(id) {
  return this.collection().then((collection) => {
    return collection.findOne({uid: id}).then((doc) => {
      return Promise.resolve(this.objectMapper(doc));
    });
  });
};

/**
 * Find users.
 * @param {String} query Find query.
 * @return {Array} the users
 */
UserDao.prototype.find = function(query) {
  return this.collection().then((collection) => {
    return collection.find(query).limit(100).toArray().then((docs) => {
      return Promise.resolve(_.map(docs, this.objectMapper));
    });
  });
};

/**
 * Create an user.
 * @param {Object} user user to create
 * @return {Object} the created user
 */
UserDao.prototype.create = function(user) {
  user = _.pick(user, ['id', 'username']);
  user.uid = user.id;
  delete user.id;
  user.date = new Date();
  return this.collection().then((collection) => {
    return collection.insertOne(user).then((/*r*/) => {
      return Promise.resolve(this.objectMapper(user));
    });
  });
};

/**
 * Update an user.
 * @param {Object} user   User to update
 * @param {Object} update Update to apply
 * @return {Object} the updated user
 */
UserDao.prototype.update = function(user, update) {
  update = _.pick(update, 'username');
  update.date = new Date();
  return this.collection().then((collection) => {
    return collection.findOneAndUpdate(
        {uid: user.id},
        {$set: update},
        {
          returnOriginal: false,
          upsert: true
        })
    .then((r) => {
      return Promise.resolve(this.objectMapper(r.value));
    });
  });
};

/**
 * Delete an user.
 * @param {Object} user user to delete
 * @return {Object} the deleted user
 */
UserDao.prototype.remove = function(user) {
  return this.collection().then((collection) => {
    return collection.findOneAndDelete({uid: user.id})
      .then((/*r*/) => {
        return Promise.resolve(this.objectMapper(user));
      });
  });
};

module.exports = UserDao;
