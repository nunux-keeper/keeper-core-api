'use strict'

const _ = require('lodash')
const logger = require('../../../helper').logger
const ReadableSearch = require('elasticsearch-streams').ReadableSearch

const buildTerm = function (name, value) {
  const result = {term: {}}
  result.term[name] = value
  return result
}

class AbstractElasticsearchDao {
  constructor (client, index, type) {
    this.client = client
    this.index = index
    this.type = type
    this.configured = false
  }

  getMapping () {
    return null
  }

  configure () {
    this.client.indices.putMapping({
      index: this.index,
      type: this.type,
      body: this.getMapping()
    }).then(() => {
      this.configured = true
      logger.debug(`Elasticsearch ${this.type} mapping configured.`)
      return Promise.resolve(true)
    }, (err) => {
      logger.error(`Unable to configure elasticsearch ${this.type} mapping.`, err)
      return Promise.reject(err)
    })
  }

  _decodeSearchHit (hit) {
    const result = Object.assign(
      {id: hit._id},
      hit._source
    )
    if (!hit._source) {
      for (const field in hit.fields) {
        if (hit.fields.hasOwnProperty(field)) {
          result[field] = _.isArray(hit.fields[field]) ? hit.fields[field][0] : hit.fields[field]
        }
      }
    }
    // console.log('_decodeSearchHit::result', result)
    return result
  }

  _decodeSearchResult (r) {
    const result = r.hits.hits.reduce((acc, hit) => {
      acc.push(this._decodeSearchHit(hit))
      return acc
    }, [])
    // console.log('_decodeSearchResult::result', result)
    return result
  }

  /**
   * Build elasticsearch query.
   * @param {Object} query query
   * @param {Object} query query
   * @returns {Object} query DSL
   */
  buildFindQuery (query, params) {
    params = params || {}
    const fields = Object.keys(this.getMapping().properties)
    const result = {
      fields: fields,
      query: {}
    }
    if (params.size) {
      result.size = params.size
    }
    const termCount = query ? Object.keys(query).length : 0
    if (termCount === 1) {
      const prop = Object.keys(query)[0]
      result.query.term = buildTerm(prop, query[prop]).term
    } else if (termCount > 1) {
      result.query.bool = {
        must: []
      }
      for (const prop in query) {
        if (query.hasOwnProperty(prop)) {
          const value = query[prop]
          result.query.bool.must.push(buildTerm(prop, value))
        }
      }
    } else {
      result.query['match_all'] = {}
    }
    logger.debug('AbstractElasticsearchDao.buildFindQuery:', result)
    return result
  }

  /**
   * Get document.
   * @param {String} id ID of the document.
   * @return {Object} the document
   */
  get (id) {
    return this.client.get({
      index: this.index,
      type: this.type,
      _source: true,
      id: id
    }).then((r) => {
      r._source.id = r._id
      return Promise.resolve(r._source)
    })
  }

  /**
   * Find documents.
   * @param {Object} query Find query.
   * @param {Object} params Find parameters.
   * @return {Array} the documents
   */
  find (query, params) {
    const p = Object.assign({
      size: 100
    }, params || {})

    return this.client.search({
      index: this.index,
      type: this.type,
      body: this.buildFindQuery(query, p)
    })
    .then((r) => {
      return Promise.resolve(this._decodeSearchResult(r))
    })
  }

  /**
   * Count documents.
   * @param {Object} query Count query.
   * @return {Array} the documents
   */
  count (query) {
    return this.client.count({
      index: this.index,
      type: this.type,
      body: this.buildFindQuery(query)
    }).then((r) => {
      return Promise.resolve(r.count)
    })
  }

  /**
   * Stream documents.
   * NOT SUPPORTED
   * @param {Object} query Find query.
   * @return {Stream} the documents stream
   */
  stream (query) {
    const searchExec = (from, callback) => {
      this.client.search({
        index: this.index,
        type: this.type,
        from: from,
        size: 100,
        body: this.buildFindQuery(query)
      }, callback)
    }

    const rs = new ReadableSearch(searchExec, this._decodeSearchHit)
    return Promise.resolve(rs)
  }

  /**
   * Create a document.
   * @param {Object} doc doc to create
   * @return {Object} the created doc
   */
  create (doc) {
    return this.client.create({
      index: this.index,
      type: this.type,
      id: doc.id,
      body: doc,
      refresh: true
    }).then(function (r) {
      if (r.created) {
        doc.id = r._id
        return Promise.resolve(doc)
      }
      return Promise.reject(r)
    })
  }

  /**
   * Update a document.
   * @param {Object} doc Document to update
   * @param {Object} update Update to apply
   * @return {Object} the updated document
   */
  update (doc, update) {
    return this.client.update({
      index: this.index,
      type: this.type,
      id: doc.id,
      body: {
        doc: update
      },
      fields: '_source',
      refresh: true
    }).then(function (r) {
      const result = r.get._source
      result.id = r._id
      return Promise.resolve(result)
    })
  }

  /**
   * Delete a document.
   * @param {Object} doc Document to to delete
   * @return {Object} the deleted document
   */
  remove (doc) {
    return this.client.delete({
      index: this.index,
      type: this.type,
      id: doc.id,
      refresh: true
    }).then((/* r */) => {
      return Promise.resolve(doc)
    })
  }
}

module.exports = AbstractElasticsearchDao
