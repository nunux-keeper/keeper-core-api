'use strict';

const _ = require('lodash'),
      AbstractMongodbDao = require('./abstract');

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractMongodbDao {
  constructor(client, index, useAsMainDatabaseEngine) {
    super(client, index, 'document');
    this.storeContent = useAsMainDatabaseEngine ? 'yes' : 'no';
  }

  getMapping() {
    return {
      properties: {
        title:        {type: 'string', store: 'yes'},
        content:      {type: 'string', store: this.storeContent},
        contentType:  {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner:        {type: 'string', store: 'yes', index: 'not_analyzed'},
        labels:       {type: 'string', store: 'yes', index: 'not_analyzed'},
        attachments:  {type: 'object'},
        origin:       {type: 'string', store: 'yes'},
        date:         {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
      }
    };
  }

  buildQuery(query) {
    var q = {
      fields: ['title', 'contentType', 'labels', 'attachments', 'origin'],
      from: query.from,
      size: query.size,
      sort: [
        '_score',
        { date: {order: query.order}}
      ],
      query: {
        filtered: {
          query: { match_all: {} },
          filter : { term : { owner : query.owner } }
        }
      }
    };

    if (query.q) {
      q.query.filtered.query = {
        query_string: {
          fields: ['title^5', 'content'],
          query: query.q
        }
      };
    }

    return q;
  }

  /**
   * Search documents.
   * @param {String} query Search query.
   * @return {Array} the documents
   */
  search(query) {
    return this.client.search({
      index: this.index,
      type: this.type,
      body: this.buildQuery(query)
    }).then((data) => {
      const result = {};
      result.total = data.hits.total;
      result.hits = [];
      data.hits.hits.forEach(function(hit) {
        result.hits.push(_.assign({id: hit._id}, hit.fields));
      });
      return Promise.resolve(result);
    });
  }
}

module.exports = DocumentDao;
