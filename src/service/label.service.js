'use strict';

const logger   = require('../helper').logger,
      labelDao = require('../dao').label;

/**
 * Label services.
 * @module label.service
 */
const LabelService = {};

/**
 * Get a label.
 * @param {String} id ID of the label.
 * @return {Object} the label
 */
LabelService.get = function(id) {
  return labelDao.get(id);
};

/**
 * Get all labels of an user.
 * @param {String} owner Owner of the labels
 * @return {Array} the labels
 */
LabelService.all = function(owner) {
  return labelDao.find({owner: owner});
};

/**
 * Create a label.
 * @param {Object} label label to create
 * @return {Object} the created label
 */
LabelService.create = function(label) {
  return labelDao.create(label)
    .then(function(_label) {
      logger.info('Label created: %j', _label);
      return Promise.resolve(_label);
    });
};

/**
 * Update a label.
 * @param {Object} label  Label to update
 * @param {Object} update Update to apply
 * @return {Object} the updated label
 */
LabelService.update = function(label, update) {
  return labelDao.update(label, update)
    .then(function(_label) {
      logger.info('Label updated: %j', _label);
      return Promise.resolve(_label);
    });
};

/**
 * Delete a label.
 * @param {Object} label label to delete
 * @return {Object} the deleted label
 */
LabelService.remove = function(label) {
  return labelDao.remove(label)
    .then(function() {
      logger.info('Label deleted: %j', label);
      return Promise.resolve(label);
    });
};

module.exports = LabelService;
