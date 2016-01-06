'use strict';

const _        = require('lodash'),
      ObjectID = require('mongodb').ObjectID,
      SearchEngine = require('../searchengine');

/**
 * Document DAO.
 * @module dao.document
 */
function DocumentDao(client) {
  this.client = client;
  this.collection = () => {
    return this.client.then((db) => {
      return Promise.resolve(db.collection('document'));
    });
  };
  this.objectMapper = function(doc) {
    return doc ? {
      id:          doc._id ? doc._id.toString() : null,
      title:       doc.title,
      content:     doc.content,
      contentType: doc.contentType,
      date:        doc.date,
      origin:      doc.origin,
      labels:      doc.labels,
      attachments: doc.attachments,
      owner:       doc.owner
    } : null;
  };
}

/**
 * Get an document.
 * @param {String} id ID of the document.
 * @return {Object} the document
 */
DocumentDao.prototype.get = function(id) {
  return this.collection().then((collection) => {
    return collection.findOne({_id: new ObjectID(id)}).then((doc) => {
      return Promise.resolve(this.objectMapper(doc));
    });
  });
};

/**
 * Search documents.
 * @param {String} query Search query.
 * @return {Array} the documents
 */
DocumentDao.prototype.search = function(query) {
  // Delegate search to the searchengine.
  return SearchEngine.search(query);
};

/**
 * Create a document.
 * @param {Object} document document to create
 * @return {Object} the created document
 */
DocumentDao.prototype.create = function(document) {
  let newDoc = _.pick(document, ['title', 'content', 'contentType', 'origin', 'labels', 'owner']);
  // Filter attachments (remove stream attribute)
  newDoc.attachments = [];
  document.attachments.forEach(function(attachment) {
    newDoc.attachments.push(_.pick(attachment, ['key', 'contentType', 'contentLength', 'origin']));
  });
  // TODO check labels
  newDoc.date = new Date();
  return this.collection().then((collection) => {
    return collection.insertOne(newDoc).then((/*r*/) => {
      newDoc = this.objectMapper(newDoc);
      // Restore attachments
      newDoc.attachments = document.attachments;
      return Promise.resolve(newDoc);
    });
  });
};

/**
 * Update a document.
 * @param {Object} document Document to update
 * @param {Object} update   Update to apply
 * @return {Object} the updated document
 */
DocumentDao.prototype.update = function(document, update) {
  update = _.pick(update, ['title', 'labels', 'content']);
  update.date = new Date();
  return this.collection().then((collection) => {
    return collection.findOneAndUpdate(
        {_id: new ObjectID(document.id)},
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
 * Delete a document.
 * @param {Object} document document to delete
 * @return {Object} the deleted document
 */
DocumentDao.prototype.remove = function(document) {
  return this.collection().then((collection) => {
    return collection.findOneAndDelete({_id: new ObjectID(document.id)})
      .then((/*r*/) => {
        return Promise.resolve(this.objectMapper(document));
      });
  });
};

module.exports = DocumentDao;
