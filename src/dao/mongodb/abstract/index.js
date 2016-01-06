'use strict';

const _        = require('lodash'),
      ObjectID = require('mongodb').ObjectID;

class AbstractMongodbDao {
  constructor(client, collection) {
    this.client = client;
    this.collection = collection;
  }

  getCollection() {
    return this.client.then((db) => {
      return Promise.resolve(db.collection(this.collection));
    });
  }

  objectMapper(doc) {
    return doc;
  }

  /**
   * Get document.
   * @param {String} id ID of the document.
   * @return {Object} the document
   */
  get(id) {
    return this.getCollection().then((collection) => {
      return collection.findOne({_id: new ObjectID(id)}).then((doc) => {
        return Promise.resolve(this.objectMapper(doc));
      });
    });
  }

  /**
   * Find documents.
   * @param {Object} query Find query.
   * @return {Array} the documents
   */
  find(query, limit) {
    if (!limit) {
      limit = 100;
    }
    return this.getCollection().then((collection) => {
      return collection.find(query).limit(limit).toArray().then((docs) => {
        return Promise.resolve(_.map(docs, this.objectMapper));
      });
    });
  }

  /**
   * Create a document.
   * @param {Object} doc doc to create
   * @return {Object} the created doc
   */
  create(doc, pick) {
    const newDoc = pick ? _.pick(doc, pick) : doc;
    return this.getCollection().then((collection) => {
      return collection.insertOne(newDoc).then((/*r*/) => {
        return Promise.resolve(this.objectMapper(newDoc));
      });
    });
  }

  /**
   * Update a document.
   * @param {Object} doc Document to update
   * @param {Object} update Update to apply
   * @return {Object} the updated document
   */
  update(doc, update) {
    return this.getCollection().then((collection) => {
      return collection.findOneAndUpdate(
          {_id: new ObjectID(doc._id || doc.id)},
          {$set: update},
          {
            returnOriginal: false,
            upsert: true
          })
      .then((r) => {
        return Promise.resolve(this.objectMapper(r.value));
      });
    });
  }

  /**
   * Delete a document.
   * @param {Object} doc Document to to delete
   * @return {Object} the deleted document
   */
  remove(doc) {
    return this.getCollection().then((collection) => {
      return collection.findOneAndDelete({_id: new ObjectID(doc._id || doc.id)})
        .then((/*r*/) => {
          return Promise.resolve(this.objectMapper(doc));
        });
    });
  }

}

module.exports = AbstractMongodbDao;
