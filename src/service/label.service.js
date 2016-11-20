'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const labelDao = require('../dao').label
const sharingDao = require('../dao').sharing

/**
 * Label services.
 * @module label.service
 */
const LabelService = {}

/**
 * Get a label.
 * @param {String} id ID of the label.
 * @return {Object} the label
 */
LabelService.get = function (id) {
  return labelDao.get(id)
}

/**
 * Get all labels of an user.
 * @param {String} owner Owner of the labels
 * @return {Array} the labels
 */
LabelService.all = function (owner) {
  return labelDao.find({owner, ghost: false}, {order: 'asc', from: 0, size: 256})
}

/**
 * Create a label.
 * @param {Object} label label to create
 * @return {Object} the created label
 */
LabelService.create = function (label) {
  label = _.pick(label, ['label', 'color', 'owner'])
  label.date = new Date()
  label.ghost = false
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
 * Remove a label.
 * @param {Object} label label to delete
 * @return {Object} the deleted label (it's ghost)
 */
LabelService.remove = function (label) {
  label.date = new Date()
  return labelDao.update(label, {ghost: true})
  .then(function (ghost) {
    logger.info('Label removed: %j', ghost)
    return Promise.resolve(ghost)
  })
}

/**
 * Restore deleted label.
 * @param {Object} ghost label to restore
 * @return {Object} the restored label
 */
LabelService.restore = function (ghost) {
  return labelDao.update(ghost, {ghost: false})
  .then(function (label) {
    logger.info('Label restored: %j', label)
    return Promise.resolve(label)
  })
}

/**
 * Destroy a label.
 * @param {Object} label label to destroy
 * @return {Object} the destroyed label
 */
LabelService.destroy = function (label) {
  // Remove eventual sharing
  const removeSharing = () => {
    return label.sharing ? sharingDao.remove({id: label.sharing}) : Promise.resolve()
  }
  return removeSharing()
  .then(() => labelDao.remove(label))
  .then((_label) => {
    logger.info('Label destroyed: %j', _label)
    return Promise.resolve(_label)
  })
}

module.exports = LabelService
