'use strict'

const AbstractMongodbDao = require('./abstract')
const logger = require('../../helper').logger

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractMongodbDao {
  constructor (client, index, useAsMainDatabaseEngine) {
    super(client, index, 'document')
    this.storeContent = useAsMainDatabaseEngine ? 'yes' : 'no'
  }

  getMapping () {
    return {
      properties: {
        title      : {type: 'string', store: 'yes'},
        content    : {type: 'string', store: this.storeContent},
        contentType: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner      : {type: 'string', store: 'yes', index: 'not_analyzed'},
        labels     : {type: 'string', store: 'yes', index: 'not_analyzed'},
        attachments: {type: 'object'},
        origin     : {type: 'string', store: 'yes'},
        date       : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }

  buildFindQuery (query, params) {
    params = params || {}
    const result = {
      _source: {
        exclude: ['*.content', '*.contentType', '*.owner', '*.date']
      },
      query: {
        filtered: {
          query: { match_all: {} },
          filter : { term : { owner : query.owner } }
        }
      }
    }

    params |= {}
    if (params.size) {
      result.size = params.size
    }

    if (params.from) {
      result.from = params.from
    }

    if (params.order) {
      result.sort = [
        '_score',
        { date: {order: params.order} }
      ]
    }

    if (query.q) {
      result.query.filtered.query = {
        query_string: {
          fields: ['title^5', 'content'],
          query: query.q
        }
      }
    }

    logger.debug('DocumentDao.buildFindQuery:', JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Search documents.
   * @param {Object} query Search query.
   * @param {Object} params Search params.
   * @return {Array} the documents
   */
  search (query, params) {
    return this.client.search({
      index: this.index,
      type: this.type,
      body: this.buildFindQuery(query, params)
    }).then((data) => {
      // console.log(JSON.stringify(data, null, 2))
      const result = {}
      result.total = data.hits.total
      result.hits = this._decodeSearchResult(data)
      // console.log(JSON.stringify(result, null, 2))
      return Promise.resolve(result)
    })
  }
}

module.exports = DocumentDao
