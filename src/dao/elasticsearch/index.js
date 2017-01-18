'use strict'

const url = require('url')
const path = require('path')
const logger = require('../../helper').logger
const globals = require('../../helper').globals
const elasticsearch = require('elasticsearch')

module.exports = function (uri) {
  const useAsMainDatabaseEngine = uri === globals.DATABASE_URI
  const u = url.parse(uri)
  const daos = {}
  const indexName = u.pathname.substring(1)
  const client = new elasticsearch.Client({
    host: u.host
  })

  daos.shutdown = function () {
    // NoOp shudown
    return Promise.resolve()
  }

  // Dynamic loading DAOs...
  const daosToConfigure = require('fs').readdirSync(__dirname).reduce((acc, file) => {
    if (/^[a-z_]+\.dao\.js$/.test(file)) {
      const name = path.basename(file, '.dao.js')
      if (!useAsMainDatabaseEngine && name !== 'document') {
        // Skip other DAO if not use as main database engine
        return acc
      }
      logger.debug('Loading %s ElasticSearch DAO..', name)
      const Dao = require(path.join(__dirname, file))
      daos[name] = new Dao(client, indexName, useAsMainDatabaseEngine)
      acc.push(daos[name])
    }
    return acc
  }, [])

  const configured = client.indices.exists({
    index: indexName
  }).then(function (exists) {
    if (!exists) {
      logger.debug('Creating index %s ...', indexName)
      return client.indices.create({
        index: indexName
      }).then(function (r) {
        logger.info('Index %s created:', indexName, r)
        return Promise.resolve(r)
      })
    } else {
      logger.debug('Index %s exists', indexName)
      return Promise.resolve()
    }
  }).catch(function (err) {
    logger.error('Unable to create index index %s ...', indexName, err)
    return Promise.reject(err)
  })

  daos.isReady = () => configured.then(() => {
    if (!daosToConfigure) {
      return Promise.resolve()
    }
    return Promise.all(daosToConfigure.map((dao) => dao.configure()))
  })

  return daos
}
