'use strict'

const path = require('path')
const logger = require('../../helper').logger
const MongoClient = require('mongodb').MongoClient

module.exports = function (uri) {
  const daos = {}
  const client = MongoClient.connect(uri, {
    autoReconnect: true,
    keepAlive: 1,
    connectTimeoutMS: 30000
  })
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
    })

    return Promise.resolve(db)
  })
  .catch((err) => {
    logger.fatal('MongodDB connection error!')
    throw err
  })

  daos.shutdown = function () {
    return client.then((db) => db.close())
  }

  // Dynamic loading DAOs...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z_]+\.dao\.js$/.test(file)) {
      const name = path.basename(file, '.dao.js')
      logger.debug('Loading %s MongoDB DAO..', name)
      const Dao = require(path.join(__dirname, file))
      daos[name] = new Dao(client)
    }
  })
  return daos
}
