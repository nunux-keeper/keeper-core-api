'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const sharingDao = require('../dao').sharing
const labelDao = require('../dao').label

/**
 * Sharing services.
 * @module sharing.service
 */
const SharingService = {}

/**
 * Get a sharing.
 * @param {String} id ID of the sharing.
 * @return {Object} the sharing
 */
SharingService.get = function (id) {
  return sharingDao.get(id)
}

/**
 * Get all sharing of an user.
 * @param {String} owner Owner of the sharing
 * @return {Array} the sharing
 */
SharingService.all = function (owner) {
  return sharingDao.find({owner}, {order: 'asc', from: 0, size: 256})
}

/**
 * Create a sharing.
 * @param {Object} sharing Sharing to create
 * @return {Object} the created sharing
 */
SharingService.create = function (sharing) {
  const newSharing = _.defaults(
    _.pick(sharing, ['owner', 'targetLabel', 'public', 'startDate', 'endDate']),
    {
      'public': false,
      date: new Date(),
      startDate: new Date()
    }
  )
  return sharingDao.create(newSharing)
  .then(function (_sharing) {
    logger.info('Sharing created: %j', _sharing)
    // Update the sharing reference of the target
    return labelDao.update({id: _sharing.targetLabel}, {sharing: _sharing.id})
    .then(() => Promise.resolve(_sharing))
  })
}

/**
 * Update a sharing.
 * @param {Object} sharing Sharing to update
 * @param {Object} update  Update to apply
 * @return {Object} the updated sharing
 */
SharingService.update = function (sharing, update) {
  update = _.defaults(
    _.pick(update, ['public', 'startDate', 'endDate']),
    { date: new Date() }
  )

  return sharingDao.update(sharing, update)
  .then(function (_sharing) {
    logger.info('Sharing updated: %j', _sharing)
    return Promise.resolve(_sharing)
  })
}

/**
 * Remove a sharing.
 * @param {Object} sharing Sharing to delete
 * @return {Object} the deleted sharing
 */
SharingService.remove = function (sharing) {
  return labelDao.update({id: sharing.targetLabel}, {sharing: null})
  .then(() => sharingDao.remove(sharing))
  .then((_sharing) => {
    logger.info('Sharing deleted: %j', _sharing)
    return Promise.resolve(_sharing)
  })
}

module.exports = SharingService
