'use strict';

const _      = require('lodash'),
      logger = require('../../helper').logger;

/**
 * Build elasticsearch query to find documents.
 * @param {String} owner owner used to filter the query
 * @param {String} q query
 * @returns {Object} query DSL
 */
var buildQuery = function(query) {
  var q = {
    fields: ['title', 'contentType', 'labels', 'attachments', 'origin'],
    from: query.from,
    size: query.size,
    sort: [
      '_score',
      { date: {order: query.order}}
    ],
    query: {
      filtered: {
        query: { match_all: {} },
        filter : { term : { owner : query.owner } }
      }
    }
  };

  if (query.q) {
    q.query.filtered.query = {
      query_string: {
        fields: ['title^5', 'content'],
        query: query.q
      }
    };
  }

  return q;
};

/**
 * Document DAO.
 * @module document.dao
 */
function DocumentDao(client, index, useAsMainDatabaseEngine) {
  const storeContent = useAsMainDatabaseEngine ? 'yes' : 'no';
  this.client = client;
  this.index = index;
  this.type = 'document';
  this.configured = false;
  this.mapping = {
    properties: {
      title:        {type: 'string', store: 'yes'},
      content:      {type: 'string', store: storeContent},
      contentType:  {type: 'string', store: 'yes', index: 'not_analyzed'},
      owner:        {type: 'string', store: 'yes', index: 'not_analyzed'},
      labels:       {type: 'string', store: 'yes', index: 'not_analyzed'},
      attachments:  {type: 'object'},
      origin:       {type: 'string', store: 'yes'},
      date:         {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
    }
  };

  this.client.indices.putMapping({
    index: this.index,
    type: this.type,
    body: this.mapping
  }).then((r) => {
    console.log(r);
    this.configured = true;
    logger.debug('Elasticsearch document mapping configured.');
  }, (err) => {
    logger.error('Unable to configure elasticsearch document mapping.', err);
  });
}

/**
 * Get an document.
 * @param {String} id ID of the document.
 * @return {Object} the document
 */
DocumentDao.prototype.get = function(id) {
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
 * Search documents.
 * @param {String} query Search query.
 * @return {Array} the documents
 */
DocumentDao.prototype.search = function(query) {
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

  return this.client.create({
    index: this.index,
    type: this.type,
    body: newDoc,
  }).then(function(r) {
    if (r.created) {
      newDoc.id = r._id;
      newDoc.attachments = document.attachments;
      return Promise.resolve(newDoc);
    }
    return Promise.reject(r);
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
  return this.client.update({
    index: this.index,
    type:  this.type,
    id: document.id,
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
 * Delete a document.
 * @param {Object} document document to delete
 * @return {Object} the deleted document
 */
DocumentDao.prototype.remove = function(document) {
  return this.client.delete({
    index: this.index,
    type:  this.type,
    id: document.id
  }).then((/*r*/) => {
    return Promise.resolve(document);
  });
};

module.exports = DocumentDao;
