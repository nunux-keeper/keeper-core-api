'use strict'

const redis = require('redis')
const url = require('url')

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
 * Connect to redis.
 * @param {String} str Redis string URI
 */
const connect = function (str) {
  const u = url.parse(str)

  let redisClient
  if (u.auth) {
    redisClient = redis.createClient({
      port: u.port,
      host: u.hostname,
      password: u.auth.split(':')[1]
    })
  } else {
    redisClient = redis.createClient({
      port: u.port,
      host: u.hostname
    })
  }
  if (u.pathname) {
    redisClient.select(u.pathname.substring(1))
  }
  return redisClient
}

/**
 * Redis helper.
 * @module redis
 */
module.exports = connect(getRedisUri())

