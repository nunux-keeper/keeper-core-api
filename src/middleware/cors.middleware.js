'use strict'

/**
 * Middleware to handle Cross-Origin Resource Sharing requests.
 */
module.exports = function () {
  return function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    res.header('Access-Control-Allow-Credentials', 'true')

    // intercept OPTIONS method
    if (req.method === 'OPTIONS') {
      res.send(200)
    } else {
      next()
    }
  }
}
