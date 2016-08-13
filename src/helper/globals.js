'use strict'

const Chance = require('chance')
const pkg = require('../../package.json')

/**
 * Globals variables.
 * @module globals
 */
const globals = {
  // App name
  NAME: pkg.name,
  // App description
  DESCRIPTION: pkg.description,
  // App version
  VERSION: pkg.version,
  // App env
  ENV: process.env.NODE_ENV || 'development',
  // Server port
  PORT: process.env.APP_PORT || 3000,
  // Auth realm
  AUTH_REALM: process.env.APP_AUTH_REALM,
  // Database URI
  DATABASE_URI: process.env.APP_DATABASE_URI || 'mongodb://mongodb/keeper',
  // Search engine URI
  SEARCH_ENGINE_URI: process.env.APP_SEARCH_ENGINE_URI || 'elasticsearch://elasticsearch/keeper',
  // Secret use to encypt token
  TOKEN_SECRET: process.env.APP_TOKEN_SECRET || new Chance().hash({length: 16}),
  // Secret use to encypt token
  TOKEN_PUB_KEY: process.env.APP_TOKEN_PUB_KEY,
  // Auto-provisioning users
  AUTO_PROVISIONING_USERS: process.env.APP_AUTO_PROVISIONING_USERS !== false
}

globals.REALM = process.env.APP_REALM || 'http://localhost:' + globals.PORT
globals.BASE_URL = globals.REALM + '/v2'

module.exports = globals
