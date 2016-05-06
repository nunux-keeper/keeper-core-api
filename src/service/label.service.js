'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const labelDao = require('../dao').label
const labelGraveyardDao = require('../dao').label_graveyard

/**
 * Label services.
 * @module label.service
 */
const LabelService = {}

/**
 * Get a label (or a ghost label).
 * @param {String} id ID of the label.
 * @param {Boolean} ghost Ghost flag
 * @return {Object} the label
 */
LabelService.get = function (id, ghost) {
  return ghost ? labelGraveyardDao.get(id) : labelDao.get(id)
}

/**
 * Get all labels of an user.
 * @param {String} owner Owner of the labels
 * @return {Array} the labels
 */
LabelService.all = function (owner) {
  return labelDao.find({owner: owner})
}

/**
 * Create a label.
 * @param {Object} label label to create
 * @return {Object} the created label
 */
LabelService.create = function (label) {
  label = _.pick(label, ['label', 'color', 'owner'])
  label.date = new Date()
  return labelDao.create(label)
    .then(function (_label) {
      logger.info('Label created: %j', _label)
      return Promise.resolve(_label)
    })
}

/**
 * Update a label.
 * @param {Object} label  Label to update
 * @param {Object} update Update to apply
 * @return {Object} the updated label
 */
LabelService.update = function (label, update) {
  update = _.pick(update, ['label', 'color'])
  update.date = new Date()
  return labelDao.update(label, update)
    .then(function (_label) {
      logger.info('Label updated: %j', _label)
      return Promise.resolve(_label)
    })
}

/**
 * Delete a label.
 * @param {Object} label label to delete
 * @return {Object} the deleted label
 */
LabelService.remove = function (label) {
  label.date = new Date()
  return labelGraveyardDao.create(label)
    .then(function () {
      return labelDao.remove(label)
    })
    .then(function () {
      logger.info('Label deleted: %j', label)
      return Promise.resolve(label)
    })
}

/**
 * Restore deleted label.
 * @param {Object} ghost label to restore
 * @return {Object} the restored label
 */
LabelService.restore = function (ghost) {
  return labelDao.create(ghost)
    .then(function (label) {
      return labelGraveyardDao.remove(label)
    }).then(function (label) {
      logger.info('Label restored: %j', label)
      return Promise.resolve(label)
    })
}

module.exports = LabelService
