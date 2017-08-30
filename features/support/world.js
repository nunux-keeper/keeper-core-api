'use strict'

const jwt = require('jsonwebtoken')
const Chance = require('chance')

let key = process.env.APP_TOKEN_SECRET || new Chance().hash({length: 16})
let algorithm = 'HS256'
if (process.env.APP_TOKEN_PRIV_KEY) {
  const fs = require('fs')
  key = fs.readFileSync(process.env.APP_TOKEN_PRIV_KEY)
  algorithm = 'RS256'
}

function World (/* callback */) {
  this.setAuthorizationHeader = function (uid, apiKey) {
    if (apiKey) {
      return function (request) {
        const encodedApiKey = new Buffer(`api:${apiKey}`).toString('base64')
        request.set('Authorization', `Basic ${encodedApiKey}`)
        return request
      }
    }
    const roles = uid === 'system' ? ['admin'] : []
    const token = uid ? jwt.sign({
      sub: uid,
      realm_access: {roles}
    }, key, {algorithm}) : null
    return function (request) {
      if (token) {
        request.set('Authorization', `Bearer ${token}`)
      }
      return request
    }
  }

  // callback(); // tell Cucumber we're finished and to use 'this' as the world instance
}

module.exports.World = World
