'use strict'

const redis = require('redis')
const url = require('url')

class RedisHelper {
  constructor (uri = 'redis://localhost:6379/1') {
    this.uri = url.parse(uri)
  }

  createClient () {
    const options = {
      port: this.uri.port,
      host: this.uri.hostname
    }
    if (this.uri.auth) {
      options.password = this.uri.auth.split(':')[1]
    }
    const client = redis.createClient(options)
    if (this.uri.pathname) {
      client.select(this.uri.pathname.substring(1))
    }
    return client
  }

}

/**
 * Get Redis URI.
 * @return {String} Redis string URI
 */
const getRedisUri = function () {
  switch (true) {
    case process.env.APP_REDIS_URI !== undefined:
      return process.env.APP_REDIS_URI
    case process.env.OPENREDIS_URL !== undefined:
      return process.env.OPENREDIS_URL
    case process.env.REDISCLOUD_URL !== undefined:
      return process.env.REDISCLOUD_URL
    default:
      return 'redis://localhost:6379/1'
  }
}

/**
 * Redis helper.
 * @module redis
 */
module.exports = new RedisHelper(getRedisUri())

