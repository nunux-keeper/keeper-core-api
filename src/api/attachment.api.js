'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Attachement API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/document/{docid}/files/{key}:
   *   get:
   *     summary: Download document attachment file
   *     tags:
   *       - document
   *       - attachment
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/docid'
   *       - $ref: '#/parameters/key'
   *       - $ref: '#/parameters/imageSize'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: file
   */
  router.get('/document/:docid/files/:key', middleware.document, controller.attachment.get)

  /**
   * @swagger
   * /v2/document/{docid}/files/{key}:
   *   delete:
   *     summary: Remove document attachment file
   *     tags:
   *       - document
   *       - attachment
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/docid'
   *       - $ref: '#/parameters/key'
   *     responses:
   *       204:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   */
  router.delete('/document/:docid/files/:key', middleware.document, controller.attachment.del)

  /**
   * @swagger
   * /v2/document/{docid}/files:
   *   post:
   *     summary: Upload document attachment file(s).
   *     tags:
   *       - document
   *       - attachment
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/docid'
   *       - name: body
   *         description: Attachment files
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Attachment"
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   */
  router.post('/document/:docid/files', middleware.document, controller.attachment.post)
}
