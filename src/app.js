'use strict'

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')
const methodOverride = require('method-override')
const expressValidator = require('express-validator')
const customValidators = require('./helper').validators
const logger = require('./helper').logger
const middleware = require('./middleware')
const appInfo = require('../package.json')

// APM
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

const env = process.env.NODE_ENV || 'development'

const app = express()

// Set properties
app.set('port', process.env.APP_PORT || 3000)
app.set('realm', process.env.APP_REALM || 'http://localhost:' + app.get('port'))
app.set('info', {
  name: appInfo.name,
  description: appInfo.description,
  version: appInfo.version,
  realm: app.get('realm'),
  env: env
})

// Disable some properties
app.disable('x-powered-by')

// app.engine('html', require('ejs').renderFile)
// app.set('views', path.join(__dirname, '..', 'var', 'views'))

// Use middlewares
app.use(middleware.logger())
app.use(middleware.cors())
app.use(compress())
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.text({ type: 'text/html' }))
app.use(middleware.multipart())
app.use(expressValidator({customValidators: customValidators}))
app.use(methodOverride())
app.use('/doc', express.static(path.join(__dirname, '..', 'documentation')))
app.use('/', require('./api/info')(app))

// Register auth API...
require('./api/auth')(app)

// Use token API.
app.use(middleware.token())

// Register API...
app.use('/v2', require('./api'))

// Error handler.
app.use(middleware.error())

// Start embedded deamons.
require('./daemon').start()

// App shutdown
const shutdown = function (signal) {
  logger.info('Stopping server...')
  require('./daemon').shutdown()
  require('./dao').shutdown()
    .catch(function (err) {
      logger.error('Error while stopping server.', err)
      process.exit(1)
    }).then(function () {
      logger.info('Server stopped.')
      process.exit(signal === 'SIGINT' ? 1 : 0)
    })

  setTimeout(function () {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit()
  }, 10 * 1000)
}

module.exports = app

// Graceful shutdown.
;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, function () {
    shutdown(signal)
  })
})

