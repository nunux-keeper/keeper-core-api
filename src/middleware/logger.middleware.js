'use strict'

const logger = require('../helper').logger

/**
 * Middleware to handle request logs.
 */
module.exports = function () {
  return function (req, res, next) {
    const start = new Date()
    const end = res.end
    res.end = function (chunk, encoding) {
      const responseTime = (new Date()).getTime() - start.getTime()
      end.call(res, chunk, encoding)
      const contentLength = parseInt(res.getHeader('Content-Length'), 10)
      const data = {
        res: res,
        req: req,
        responseTime: responseTime,
        contentLength: isNaN(contentLength) ? 0 : contentLength
      }
      logger.info('%s %s %d %dms - %d', data.req.method, data.req.url, data.res.statusCode, data.responseTime, data.contentLength)
    }
    next()
  }
}
