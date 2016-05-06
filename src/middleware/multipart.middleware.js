'use strict'

const os = require('os')
const path = require('path')
const multiparty = require('multiparty')
const logger = require('../helper').logger

const uploadDir = process.env.APP_STORAGE_LOCAL_DIR ? path.join(process.env.APP_STORAGE_LOCAL_DIR, 'upload') : os.tmpdir()

/**
 * Middleware to handle multipart/form-data requests.
 * @module multipart
 */
module.exports = function () {
  return function (req, res, next) {
    const ct = req.header('Content-Type')
    if (req.method === 'POST' && /^multipart\/form-data/.test(ct)) {
      const form = new multiparty.Form({uploadDir: uploadDir})

      req.files = []
      req.fields = {}

      form.on('error', next)
      form.on('file', function (name, file) {
        req.files.push(file)
      })
      form.on('field', function (name, value) {
        req.fields[name] = value
        if (name === 'document') {
          try {
            req.body = JSON.parse(value)
          } catch (e) {
            logger.error('Unable to parse document field.', e)
          }
        }
      })
      form.on('close', function () {
        next()
      })

      form.parse(req)
    } else {
      next()
    }
  }
}
