'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const storage = require('../storage')
const decorator = require('../decorator')
const documentGraveyardDao = require('../dao').document_graveyard

/**
 * Graveyard services.
 * @module graveyard.service
 */
const GraveyardService = {}

/**
 * Get a document ghost.
 * @param {String} docId Document ID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the document
 */
GraveyardService.get = function (docId, decorators) {
  return documentGraveyardDao.get(docId)
  .then(function (doc) {
    return decorators ? decorator.decorate(doc, ...decorators) : doc
  })
}

/**
 * Find ghosts from the graveyard.
 * @param {String} owner Owner of the document
 * @param {String} query Search query
 * @return {Object} the documents
 */
GraveyardService.find = function (owner, query) {
  const _params = _.defaults(
    _.pick(query, ['from', 'order', 'size']),
    {order: 'asc', size: 50}
  )
  const _query = _.omit(query, ['from', 'order', 'size'])
  _query.owner = owner

  const result = {}
  return documentGraveyardDao.count(_query)
  .then((count) => {
    result.total = count
    return documentGraveyardDao.find(_query, _params)
  })
  .then((ghosts) => {
    result.hits = ghosts
    return Promise.resolve(result)
  })
}

/**
 * Remove all documents from the graveyard for an user.
 * @param {String} owner Owner of the documents
 * @return {Object} the deletion promise
 */
GraveyardService.empty = function (owner) {
  logger.debug('Removing all documents from the graveyard of %s ...', owner)
  return documentGraveyardDao.stream({owner})
  .then((s) => {
    return new Promise((resolve, reject) => {
      s.on('err', reject)
      s.on('end', resolve)
      s.on('data', (ghost) => {
        logger.debug('Removing ghost files #%s ...', ghost.id)
        s.pause()
        const container = storage.getContainerName(ghost.owner, 'documents', ghost.id)
        storage.remove(container)
        .then(() => documentGraveyardDao.remove(ghost))
        .then(() => s.resume())
      })
    })
  })
}

module.exports = GraveyardService
