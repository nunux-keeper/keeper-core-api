'use strict'

const _ = require('lodash')
const url = require('url')
const logger = require('../helper').logger
const globals = require('../helper').globals

/**
 * Search engine.
 * @module dao/searchengine
 */
class SearchEngine {
  /**
   * Constructor.
   */
  constructor () {
    // Disable the event handler if the search feature is not delegated.
    this.disabled = globals.SEARCH_ENGINE_URI === globals.DATABASE_URI
    if (this.disabled) {
      return
    }
    const providerName = url.parse(globals.SEARCH_ENGINE_URI).protocol.slice(0, -1)
    this._provider = require(`./${providerName}`)(globals.SEARCH_ENGINE_URI)
  }

  /**
   * Get search engine provider.
   * @return {Object} the provider
   */
  getProvider () {
    if (this.disabled) {
      return Promise.reject('Search engine disabled.')
    }
    return Promise.resolve(this._provider.document)
  }

  /**
   * Wait until the search engine is ready.
   * @return {Promise} Promise of the readyness
   */
  isReady () {
    if (this.disabled) {
      return Promise.resolve('Search engine disabled.')
    }
    return this._provider.isReady()
  }

  /**
   * Index a document.
   * @param {Object} doc Document to index
   * @return {Promise} Indexed document
   */
  indexDocument (doc) {
    return this.getProvider().then((provider) => {
      logger.debug('Indexing the document...', doc.id)
      return provider.create(doc)
    }).catch((err) => {
      logger.error('Unable to index document:', doc, err)
      return Promise.reject(err)
    })
  }

  /**
   * Re-index a document.
   * @param {Object} doc Document to re-index
   * @return {Promise} Re-indexed document
   */
  reindexDocument (doc, params = {}) {
    const {create = false} = params
    return this.getProvider().then((provider) => {
      if (create) {
        logger.debug('Reindexing from scratch the document...', doc.id)
        return provider.create(doc, params)
      } else {
        logger.debug('Reindexing the document...', doc.id)
        return provider.update(doc, _.omit(doc, 'id'), params)
      }
    }).catch((err) => {
      logger.error('Unable to reindex document:', doc, err)
      return Promise.reject(err)
    })
  }

  /**
   * Unindex a document.
   * @param {Object} doc Document to unindex
   * @return {Promise} Unindexed document
   */
  unindexDocument (doc) {
    return this.getProvider().then((provider) => {
      logger.debug('Unindexing the document...', doc.id)
      return provider.remove(doc)
    }).catch((err) => {
      logger.error('Unable to unindex document:', doc, err)
      return Promise.reject(err)
    })
  }

  /**
   * Search documents.
   * @param {Object} query Search query.
   * @param {Object} params Search params.
   * @return {Promise} the search result.
   */
  search (query, params) {
    return this.getProvider().then((provider) => {
      logger.debug('Searching documents...', query, params)
      return provider.search(query, params)
    }).catch((err) => {
      logger.error('Unable to search documents:', query, err)
      return Promise.reject(err)
    })
  }
}

module.exports = new SearchEngine()
