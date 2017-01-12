'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Attachement API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/documents/{docid}/files/{key}:
   *   get:
   *     summary: Download document attachment file
   *     tags:
   *       - Document
   *       - Attachment
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *       - $ref: '#/parameters/key'
   *       - $ref: '#/parameters/imageSize'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: file
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/documents/:docid/files/:key', middleware.document, controller.attachment.get)

  /**
   * @swagger
   * /v2/documents/{docid}/files/{key}:
   *   delete:
   *     summary: Remove document attachment file
   *     tags:
   *       - Document
   *       - Attachment
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *       - $ref: '#/parameters/key'
   *     responses:
   *       205:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/documents/:docid/files/:key', middleware.document, controller.attachment.del)

  /**
   * @swagger
   * /v2/documents/{docid}/files:
   *   post:
   *     summary: Upload document attachment file(s).
   *     tags:
   *       - Document
   *       - Attachment
   *     consumes:
   *       - multipart/form-data
   *     parameters:
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
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/documents/:docid/files', middleware.document, controller.attachment.post)
}
