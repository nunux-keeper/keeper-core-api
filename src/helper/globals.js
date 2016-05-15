'use strict'

const Chance = require('chance')

/**
 * Globals variables.
 * @module globals
 */
module.exports = {
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

