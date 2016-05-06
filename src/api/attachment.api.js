'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Attachement API.
 */
module.exports = function (router) {
  /**
   * @api {get} /document/:id/files/:key Get document attachment
   *
   * @apiVersion 0.0.1
   * @apiName GetDocumentAttachment
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id  Id of the document
   * @apiParam {String} key Key of the attachment.
   *
   * @apiParam {String} [size] Size of the image (if conten type of the attachment is an image).
   *
   * This is useful to get a thumbnail of the image attachment.
   * Only the size "200x150" is supported.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   */
  router.get('/document/:id/files/:key', middleware.document, controller.attachment.get)
}
