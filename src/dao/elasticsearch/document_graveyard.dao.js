'use strict'

const AbstractMongodbDao = require('./abstract')
const logger = require('../../helper').logger

/**
 * Document graveyard DAO.
 * @module document_graveyard.dao
 */
class DocumentGraveyardDao extends AbstractMongodbDao {
  constructor (client, index) {
    super(client, index, 'document_graveyard')
  }

  getMapping () {
    return {
      properties: {
        title      : {type: 'string', store: 'yes'},
        content    : {type: 'string', store: 'yes'},
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

    logger.debug('DocumentGraveyardDao.buildFindQuery:', result)
    return result
  }

}

module.exports = DocumentGraveyardDao
