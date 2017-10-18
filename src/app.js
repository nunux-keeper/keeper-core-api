'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const compress = require('compression')
const path = require('path')
const methodOverride = require('method-override')
const expressValidator = require('express-validator')
const customValidators = require('./helper').validators
const logger = require('./helper').logger
const globals = require('./helper').globals
const urlConfig = require('./helper').urlConfig
const middleware = require('./middleware')
const swaggerJSDoc = require('swagger-jsdoc')
const kue = require('kue')

// APM
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

const app = express()

// Set properties
app.set('port', urlConfig.port)

// Disable some properties
app.disable('x-powered-by')

// Use middlewares
app.use(middleware.logger())
app.use(middleware.cors())
app.use(compress())
app.use(bodyParser.json({ type: 'application/json', limit: '5mb' }))
app.use(bodyParser.text({ type: 'text/html', limit: '5mb' }))
app.use(middleware.multipart())
app.use(expressValidator({customValidators: customValidators}))
app.use(methodOverride())

// Options for the swagger docs
const options = {
  // Import swaggerDefinitions
  swaggerDefinition: {
    info: {
      title: globals.NAME,
      version: globals.VERSION,
      description: globals.DESCRIPTION
    },
    host: urlConfig.host,
    basePath: urlConfig.basePath,
    securityDefinitions: {
      authenticated: {
        type: 'oauth2',
        authorizationUrl: globals.AUTH_REALM + '/protocol/openid-connect/auth',
        tokenUrl: globals.AUTH_REALM + '/protocol/openid-connect/token',
        flow: 'accessCode',
        // flow: 'implicit',
        scopes: {
          user: 'Authenticated user'
        }
      }
    }
  },
  // Path to the API docs
  apis: ['./src/api/*.js', './src/api/swagger/*.yaml']
}

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options)

// Serve swagger docs
app.use('/', require('./api/info')())
app.use('/api-docs', express.static(path.join(__dirname, '../doc/swagger-ui')))
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// AuthN Middlewares...
app.use(`/${urlConfig.apiVersion}`,
  // Bypass authentification if public API
  middleware.auth_bypass({
    method: ['POST', 'GET'],
    path: [/^\/public\//]
  }),
  // Allow API key for fetch and create document
  middleware.auth_apikey({
    method: ['POST', 'GET'],
    path: [/^\/documents/]
  }),
  // Else require a valid JWT
  middleware.auth_jwt()
)

// Register API...
app.use(`/${urlConfig.apiVersion}`, require('./api'))

// register Kue GUI...
app.use(`/${urlConfig.apiVersion}/admin/worker`, middleware.admin.isAdmin, kue.app)

// Error handler.
app.use(middleware.error())

// App shutdown
const shutdown = function (signal) {
  logger.info('Stopping server...')
  require('./service').shutdown()
    .then(function () {
      const retval = signal === 'SIGINT' ? 1 : 0
      logger.info(`Server stopped (${retval})`)
      process.exit(retval)
    }, function (err) {
      logger.error('Error while stopping server.', err)
      process.exit(1)
    })

  setTimeout(function () {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10 * 1000)
}

app.isReady = function () {
  return require('./service').isReady()
  .then(() => {
    if (globals.EMBEDDED_WORKER) {
      logger.info('Starting embedded job worker...')
      require('./job/embedded').start()
    }
    logger.info('App is ready.')
    return Promise.resolve()
  })
  .catch((err) => {
    logger.error('App not ready.', err)
    throw err
  })
}

module.exports = app

// Graceful shutdown.
;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, function () {
    shutdown(signal)
  })
})

