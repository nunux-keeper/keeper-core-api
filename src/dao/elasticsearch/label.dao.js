'use strict';

const _      = require('lodash'),
      logger = require('../../helper').logger;

/**
 * Build elasticsearch query to find labels.
 * @param {String} owner owner used to filter the query
 * @param {String} q query
 * @returns {Object} query DSL
 */
var buildQuery = function(query) {
  return {
    fields: ['label', 'color', 'date'],
    size: 100,
    query: {
      filtered: {
        query: { match_all: {} },
        filter : { term : { owner : query.owner } }
      }
    }
  };
};

/**
 * Label DAO.
 * @module label.dao
 */
function LabelDao(client, index) {
  this.client = client;
  this.index = index;
  this.type = 'label';
  this.configured = false;
  this.mapping = {
    properties: {
      label: {type: 'string', store: 'yes', index: 'not_analyzed'},
      color: {type: 'string', store: 'yes', index: 'not_analyzed'},
      owner: {type: 'string', store: 'yes', index: 'not_analyzed'},
      date:  {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
    }
  };

  this.client.indices.putMapping({
    index: this.index,
    type: this.type,
    body: this.mapping
  }).then(() => {
    this.configured = true;
    logger.debug('Elasticsearch label mapping configured.');
  }, (err) => {
    logger.error('Unable to configure elasticsearch label mapping.', err);
  });
}

/**
 * Get a label.
 * @param {String} id ID of the label.
 * @return {Object} the label
 */
LabelDao.prototype.get = function(id) {
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
 * Find labels.
 * @param {String} query Search query.
 * @return {Array} the labels
 */
LabelDao.prototype.find = function(query) {
  return this.client.search({
    index: this.index,
    type: this.type,
    body: buildQuery(query)
  }).then((r) => {
    const result = [];
    r.hits.hits.forEach(function(hit) {
      const label = {id: hit._id};
      for (const field in hit.fields) {
        if (hit.fields.hasOwnProperty(field)) {
          label[field] = _.isArray(hit.fields[field]) ? hit.fields[field][0] : hit.fields[field];
        }
      }
      result.push(label);
    });
    return Promise.resolve(result);
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

  return this.client.create({
    index: this.index,
    type: this.type,
    body: label,
    refresh: true
  }).then(function(r) {
    if (r.created) {
      label.id = r._id;
      return Promise.resolve(label);
    }
    return Promise.reject(r);
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
  return this.client.update({
    index: this.index,
    type:  this.type,
    id: label.id,
    body: {
      doc: update
    },
    fields: '_source',
    refresh: true
  }).then(function(r) {
    const result = r.get._source;
    result.id = r._id;
    return Promise.resolve(result);
  });
};

/**
 * Delete a label.
 * @param {Object} label The label to delete
 * @return {Object} the deleted label
 */
LabelDao.prototype.remove = function(label) {
  return this.client.delete({
    index: this.index,
    type:  this.type,
    id: label.id,
    refresh: true
  }).then((/*r*/) => {
    return Promise.resolve(label);
  });
};

module.exports = LabelDao;
