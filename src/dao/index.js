'use strict'

const url = require('url')
const globals = require('../helper').globals

const provider = url.parse(globals.DATABASE_URI).protocol.slice(0, -1)

module.exports = require(`./${provider}`)(globals.DATABASE_URI)

