'use strict'

const path = require('path')
const logger = require('../../helper').logger
const MongoClient = require('mongodb').MongoClient

module.exports = function (uri) {
  const daos = {}
  const client = MongoClient.connect(uri)
  .then((db) => {
    logger.info('MongodDB connection success')
    db.on('close', function () {
      logger.info('MongodDB connection close')
    })
    db.on('error', function (err) {
      logger.error('MongodDB error', err)
    })
    db.on('timeout', function (err) {
      logger.error('MongodDB timeout', err)
      throw err
    })

    return Promise.resolve(db)
  })
  .catch((err) => {
    logger.fatal('MongodDB connection error!')
    throw err
  })

  daos.shutdown = function () {
    logger.debug('Closing MongodDB connections...')
    return client.then((db) => db.close())
  }

  // Dynamic loading DAOs...
  const daosToConfigure = require('fs').readdirSync(__dirname).reduce((acc, file) => {
    if (/^[a-z_]+\.dao\.js$/.test(file)) {
      const name = path.basename(file, '.dao.js')
      logger.debug('Loading %s MongoDB DAO..', name)
      const Dao = require(path.join(__dirname, file))
      daos[name] = new Dao(client)
      acc.push(daos[name])
    }
    return acc
  }, [])

  daos.isReady = () => client.then((db) => {
    logger.debug('Configuring %s database...', db.databaseName)
    if (!daosToConfigure) {
      return Promise.resolve()
    }
    return Promise.all(daosToConfigure.map((dao) => dao.configure()))
  })

  return daos
}
