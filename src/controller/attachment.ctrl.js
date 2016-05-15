'use strict'

const _ = require('lodash')
const errors = require('../helper').errors
const attachmentservice = require('../service').attachment

/**
 * Controller to manage document attachments.
 * @module attachment.ctrl
 */
const AttachementCtrl = {}

/**
 * Get a document attachment.
 */
AttachementCtrl.get = function (req, res, next) {
  const doc = req.requestData.document
  const attachment = _.findWhere(doc.attachments, {key: req.params.key})
  if (!attachment) {
    return next(new errors.NotFound('Attachment not found in the document.'))
  }
  attachmentservice.available(doc, attachment)
    .then(function (available) {
      if (!available) {
        if (attachment.origin) {
          // Attachment not yet available: redirect to the source
          return res.redirect(302, attachment.origin)
        } else {
          return next(new errors.NotFound('Attachment not available.'))
        }
      }
      if (req.query.size && /^image\//.test(attachment.contentType)) {
        // If conten-type is an image and the parameter size is defined, then get the thumbnail
        attachmentservice.getThumbnail(doc, attachment, req.query.size)
          .then(function (thumbPath) {
            res.sendfile(thumbPath, {maxAge: 86400000})
          }).catch(next)
      } else {
        attachmentservice.stream(doc, attachment)
          .then(function (metas) {
            // Send the attachment file content...
            res.append('Content-Length', metas.contentLenght)
            res.append('Content-Type', metas.contentType)
            res.append('Cache-Control', 'public, max-age=86400')
            res.append('Last-Modified', metas.lastModified)
            metas.stream.pipe(res)
          }).catch(next)
      }
    })
}

AttachementCtrl.del = function (req, res, next) {
  return next(new errors.BadRequest('Not yet implemented.'))
}

AttachementCtrl.post = function (req, res, next) {
  return next(new errors.BadRequest('Not yet implemented.'))
}

module.exports = AttachementCtrl
