'use strict';

const _      = require('lodash'),
      errors = require('../helper').errors,
      attachmentservice = require('../service').attachment;
/**
 * Controller to manage document attachments.
 * @module attachment.ctrl
 */
const AttachementCtrl = {};

/**
 * Get a document attachment.
 */
AttachementCtrl.get = function(req, res, next) {
  const doc = req.requestData.document;
  const attachment = _.findWhere(doc.attachments, {key: req.params.key});
  if (!attachment) {
    return next(new errors.NotFound('Attachment not found in the document.'));
  }
  if (attachment.origin && !attachment.contentType) {
    // Attachment not yet available: redirect to the source
    return res.redirect(302, attachment.origin);
  }
  if (req.query.size && /^image\//.test(attachment.contentType)) {
    // If conten-type is an image and the parameter size is defined, then get the thumbnail
    attachmentservice.getThumbnail(doc, attachment, req.query.size)
      .then(function(thumbPath) {
        res.sendfile(thumbPath, {maxAge: 86400000});
      });
  } else {
    attachmentservice.stream(doc, attachment)
      .then(function(metas) {
        // Send the attachment file content...
        res.set('Content-Length', metas.size);
        res.set('Content-Type', metas.contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.set('Last-Modified', metas.lastModified);
        metas.stream.pipe(res);
      });
  }
};

module.exports = AttachementCtrl;
