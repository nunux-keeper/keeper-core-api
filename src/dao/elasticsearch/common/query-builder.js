'use strict'

const logger = require('../../../helper').logger
const Bodybuilder = require('bodybuilder')

/**
 * User DAO.
 * @module user.dao
 */
class QueryBuilder {
  constructor () {
    this.body = new Bodybuilder()
  }

  size (size) {
    if (size) {
      this.body.size(size)
    }
    return this
  }

  from (from) {
    if (from) {
      this.body.from(from)
    }
    return this
  }

  sort (field, order = 'desc') {
    if (field) {
      this.body.sort(field, order)
    }
    return this
  }

  fields (fields) {
    if (fields) {
      this.body.rawOption('_source', fields)
    }
    return this
  }

  terms (terms) {
    if (terms) {
      Object.keys(terms).forEach((t) => {
        this.body.query('term', t, terms[t])
      })
    }
    return this
  }

  filters (filters) {
    if (filters) {
      Object.keys(filters).forEach((f) => {
        this.body.filter('term', f, filters[f])
      })
    }
    return this
  }

  fulltext (q, fields) {
    if (q) {
      if (fields) {
        this.body.query('query_string', fields, q)
      } else {
        this.body.query('query_string', q)
      }
    }
    return this
  }

  debug (debug = false) {
    if (debug) {
      logger.debug('Builded query:', JSON.stringify(this.build()))
      console.log('QUERY', JSON.stringify(this.build(), null, 2))
    }
    return this
  }

  build () {
    const result = this.body.build('v2')
    if (!result.query) {
      result.query = {match_all: {}}
    }
    return result
  }
}

module.exports = QueryBuilder

