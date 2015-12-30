'use strict';

const _        = require('lodash'),
      ObjectID = require('mongodb').ObjectID;

/**
 * Label DAO.
 * @module label.dao
 */
function LabelDao(client) {
  this.client = client;
  this.collection = () => {
    return this.client.then((db) => {
      return Promise.resolve(db.collection('label'));
    });
  };
  this.objectMapper = function(doc) {
    return {
      id:    doc._id,
      label: doc.label,
      color: doc.color,
      owner: doc.owner,
      date:  doc.date
    };
  };
}

/**
 * Get a label.
 * @param {String} id ID of the label.
 * @return {Object} the label
 */
LabelDao.prototype.get = function(id) {
  return this.collection().then((collection) => {
    return collection.findOne({_id: new ObjectID(id)}).then((doc) => {
      return Promise.resolve(this.objectMapper(doc));
    });
  });
};

/**
 * Find labels.
 * @param {String} query Find query.
 * @return {Array} the labels
 */
LabelDao.prototype.find = function(query) {
  return this.collection().then((collection) => {
    return collection.find(query).limit(100).toArray().then((docs) => {
      return Promise.resolve(_.map(docs, this.objectMapper));
    });
  });
};

/**
 * Create a label.
 * @param {Object} label label to create
 * @return {Object} the created label
 */
LabelDao.prototype.create = function(label) {
  label = _.pick(label, ['label', 'color', 'owner']);
  label.date = new Date();
  return this.collection().then((collection) => {
    return collection.insertOne(label).then((/*r*/) => {
      return Promise.resolve(this.objectMapper(label));
    });
  });
};

/**
 * Update a label.
 * @param {Object} label  Label to update
 * @param {Object} update Update to apply
 * @return {Object} the updated label
 */
LabelDao.prototype.update = function(label, update) {
  update = _.pick(update, ['label', 'color']);
  update.date = new Date();
  return this.collection().then((collection) => {
    return collection.findOneAndUpdate(
        {_id: new ObjectID(label.id)},
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
 * Delete a label.
 * @param {Object} label label to delete
 * @return {Object} the deleted label
 */
LabelDao.prototype.remove = function(label) {
  return this.collection().then((collection) => {
    return collection.findOneAndDelete({_id: new ObjectID(label.id)})
      .then((/*r*/) => {
        return Promise.resolve(this.objectMapper(label));
      });
  });
};

module.exports = LabelDao;
