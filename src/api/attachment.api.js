'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Attachement API.
 */
module.exports = function (router) {
  /**
   * @api {get} /document/:id/files/:key Download document attachment file.
   *
   * @apiVersion 2.0.0
   * @apiName GetDocumentAttachment
   * @apiGroup attachment
   * @apiPermission user
   *
   * @apiParam {String} id  Id of the document
   * @apiParam {String} key Key of the attachment.
   *
   * @apiParam {String} [size] Size of the image (if conten type of the attachment is an image).
   *
   * This is useful to get a thumbnail of the image attachment.
   * Only the size "320x200" is supported.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   */
  router.get('/document/:id/files/:key', middleware.document, controller.attachment.get)

  /**
   * @api {delete} /document/:id/files/:key Remove document attachment file.
   *
   * @apiVersion 2.0.0
   * @apiName DeleteDocumentAttachment
   * @apiGroup attachment
   * @apiPermission user
   *
   * @apiParam {String} id  Id of the document
   * @apiParam {String} key Key of the attachment.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/document/:id/files/:key', middleware.document, controller.attachment.del)

  /**
   * @api {post} /document/:id/files Upload document attachment file(s).
   *
   * @apiVersion 2.0.0
   * @apiName AddDocumentAttachment
   * @apiGroup attachment
   * @apiPermission user
   *
   * @apiParam {String} id    Id of the document
   * @apiParam {File[]} files Attachment files.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 201 OK
   */
  router.post('/document/:id/files', middleware.document, controller.attachment.post)
}
