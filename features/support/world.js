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
  this.getToken = function (uid) {
    return jwt.sign({sub: uid}, key, {algorithm})
  }

  // callback(); // tell Cucumber we're finished and to use 'this' as the world instance
}

module.exports.World = World
