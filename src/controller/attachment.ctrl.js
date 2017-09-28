'use strict'

const hal = require('hal')
const errors = require('../helper').errors
const urlConfig = require('../helper').urlConfig
const attachmentService = require('../service').attachment
const documentService = require('../service').document

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
  const attachment = doc.attachments.find(item => item.key === req.params.key)
  if (!attachment) {
    return next(new errors.NotFound('Attachment not found in the document.'))
  }
  attachmentService.available(doc, attachment)
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
        attachmentService.getThumbnail(doc, attachment, req.query.size)
          .then(function (thumbPath) {
            res.sendfile(thumbPath, {maxAge: 86400000})
          }).catch(next)
      } else {
        attachmentService.stream(doc, attachment)
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
  const doc = req.requestData.document
  const attachment = doc.attachments.find(item => item.key === req.params.key)
  if (!attachment) {
    return next(new errors.NotFound('Attachment not found in the document.'))
  }
  documentService.removeAttachment(doc, attachment)
  .then(function (result) {
    res.status(205).json()
  }, next)
}

AttachementCtrl.post = function (req, res, next) {
  const doc = req.requestData.document
  documentService.addAttachment(doc, req.files)
  .then(function (result) {
    const resource = new hal.Resource(result, urlConfig.resolve(`/files/${result.id}`))
    res.status(201).json(resource)
  }, next)
}

module.exports = AttachementCtrl
