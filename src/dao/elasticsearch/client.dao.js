'use strict'

const AbstractElasticsearchDao = require('./common/abstract.dao')

/**
 * Client DAO.
 * @module client.dao
 */
class ClientDao extends AbstractElasticsearchDao {
  constructor (client, index) {
    super(client, index, 'client')
  }

  getMapping () {
    return {
      properties: {
        name:         {type: 'string', store: 'yes', index: 'not_analyzed'},
        clientId:     {type: 'string', store: 'yes', index: 'not_analyzed'},
        secret:       {type: 'string', store: 'yes', index: 'not_analyzed'},
        redirectUris: {type: 'string', store: 'yes', index: 'not_analyzed'},
        webOrigins:   {type: 'string', store: 'yes', index: 'not_analyzed'},
        registrationAccessToken: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner:        {type: 'string', store: 'yes', index: 'not_analyzed'},
        cdate:        {type: 'date', store: 'yes', format: 'date_optional_time'},
        mdate:        {type: 'date', store: 'yes', format: 'date_optional_time'}
      }
    }
  }
}

module.exports = ClientDao

