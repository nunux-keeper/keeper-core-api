'use strict'

/**
 * Middleware to handle Cross-Origin Resource Sharing requests.
 */
module.exports = function () {
  return function (req, res, next) {
    // TODO Use whitelisted origin
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    res.header('Access-Control-Allow-Credentials', 'true')

    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  }
}
