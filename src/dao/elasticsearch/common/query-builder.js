'use strict'

const logger = require('../../../helper').logger
const _ = require('lodash')

const buildTerm = function (name, value) {
  const result = {term: {}}
  result.term[name] = value
  return result
}

/**
 * User DAO.
 * @module user.dao
 */
class QueryBuilder {
  constructor () {
    this.result = {
      query: {}
    }
  }

  size (size) {
    if (size) {
      this.result.size = size
    }
    return this
  }

  from (from) {
    if (from) {
      this.result.from = from
    }
    return this
  }

  sort (order) {
    if (order) {
      this.result.sort = [
        '_score',
        { date: {order: order} }
      ]
    }
    return this
  }

  fields (fields) {
    if (fields) {
      this.result.fields = fields
    }
    return this
  }

  terms (terms) {
    if (terms) {
      const keys = Object.keys(terms)
      const nbTerms = keys.length
      if (nbTerms === 1) {
        const t = keys[0]
        this.result.query = buildTerm(t, terms[t])
      } else {
        const ts = keys.reduce((acc, t) => {
          acc.push(buildTerm(t, terms[t]))
          return acc
        }, [])
        this.result.query.bool = {
          must: ts
        }
      }
    } else {
      this.result.query.match_all = {}
    }
    return this
  }

  filtered (filters) {
    if (filters) {
      const terms = _.keys(filters)
      if (!this.result.query.filtered) {
        this.result.query.filtered = {
          query: { match_all: {} },
          filter: {}
        }
      }
      let filter = null
      if (terms.length === 1) {
        const t = terms[0]
        filter = {
          term: {}
        }
        filter.term[t] = filters[t]
      } else {
        filter = { bool: {} }
        filter.bool.must = terms.reduce((acc, t) => {
          acc.push(buildTerm(t, filters[t]))
          return acc
        }, [])
      }
      this.result.query.filtered.filter = filter
    }
    return this
  }

  exclude (fields) {
    if (fields) {
      this.result._source = {
        exclude: fields
      }
    }
    return this
  }

  fulltext (q, fields) {
    if (q) {
      const qs = {
        fields: fields,
        query: q
      }
      if (this.result.query.filtered) {
        this.result.query.filtered.query = {
          query_string: qs
        }
      } else {
        this.result.query_string = qs
      }
    }
    return this
  }

  debug () {
    logger.debug('Builded query:', JSON.stringify(this.result))
    // console.log('QUERY', JSON.stringify(this.result, null, 2))
    return this
  }

  build () {
    return this.result
  }
}

module.exports = QueryBuilder

