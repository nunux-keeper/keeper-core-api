'use strict'

const _ = require('lodash')
const AbstractMongodbDao = require('./abstract')

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

  buildSearchQuery (query) {
    const result = {
      size: query.size,
      query: {
        filtered: {
          query: { match_all: {} },
          filter : { term : { owner : query.owner } }
        }
      }
    }

    if (query.from) {
      result.from = query.from
    }

    if (query.order) {
      result.sort = [
        '_score',
        { date: {order: query.order} }
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

    // console.log(JSON.stringify(result, null, 2))
    return result
  }

  /**
   * Search documents.
   * @param {String} query Search query.
   * @return {Array} the documents
   */
  search (query) {
    return this.client.search({
      index: this.index,
      type: this.type,
      body: this.buildSearchQuery(query)
    }).then((data) => {
      // console.log(JSON.stringify(data, null, 2))
      const result = {}
      result.total = data.hits.total
      result.hits = _.reduce(data.hits.hits, (acc, item) => {
        acc.push(item._source)
        return acc
      }, [])
      return Promise.resolve(result)
    })
  }
}

module.exports = DocumentDao
