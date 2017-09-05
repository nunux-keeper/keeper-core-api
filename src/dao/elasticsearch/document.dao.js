'use strict'

const _ = require('lodash')
const AbstractElasticsearchDao = require('./common/abstract.dao')
const QueryBuilder = require('./common/query-builder')

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractElasticsearchDao {
  constructor (client, index, useAsMainDatabaseEngine) {
    super(client, index, 'document')
    this.storeContent = useAsMainDatabaseEngine ? 'yes' : 'no'
    // this.debug = true
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
        ghost      : {type: 'boolean', store: 'yes'},
        date       : {type: 'date', store: 'yes', format: 'date_optional_time'}
      }
    }
  }

  buildFindQuery (query, params) {
    params = params || {}
    let fields = Object.getOwnPropertyNames(this.getMapping().properties)
    if (!this.storeContent) {
      fields = fields.filter(field => field !== 'content')
    }
    const terms = _.pick(query, ['owner', 'ghost', 'labels'])

    const result = new QueryBuilder()
    .fields(fields)
    .size(params.size)
    .from(params.from)
    .sort(params.order ? 'date' : null, params.order)

    if (query.q) {
      result.fulltext(query.q, ['title^5', 'content']).filters(terms)
    } else {
      result.terms(terms)
    }

    return result.debug(this.debug).build()
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
