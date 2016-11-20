'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Sharing API.
 */
module.exports = function (router) {
  /**
   * @api {get} /sharing Get all user's sharing.
   * @apiVersion 2.0.0
   * @apiName GetAllSharing
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiSuccess {Sharing[]} sharing List of sharing.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       sharing: [
   *         {
   *           "id": "xxxxx"
   *           "targetLabel": "123456789"
   *         },
   *         {...}
   *       ]
   *     }
   */
  router.get('/sharing', controller.sharing.all)

  /**
   * @api {get} /sharing/:id Get sharing documents.
   * @apiVersion 2.0.0
   * @apiName GetSharingDocuments
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id Id of the sharing.
   *
   * @apiSuccess {Document[]} documents List of document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       documents: [
   *         {
   *           "id": "xxxxx"
   *           "title": "Bla bla bla",
   *           "contentType": "text/html"
   *         },
   *         {...}
   *       ]
   *     }
   */
  router.get('/sharing/:sid', middleware.sharing.get, controller.sharing.getDocuments)

  /**
   * @api {get} /sharing/:id/:docid Get shared document.
   * @apiVersion 2.0.0
   * @apiName GetSharedDocument
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id Id of the sharing.
   * @apiParam {String} docid Id of the document.
   *
   * @apiSuccess {Document} document The document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       document: {
   *         "id": "xxxxx"
   *         "title": "Bla bla bla",
   *         "contentType": "text/html",
   *         "content": "<p>bla bla bla</p>"
   *       }
   *     }
   */
  router.get('/sharing/:sid/:docid', middleware.sharing.get, middleware.document, controller.sharing.getDocument)

  /**
   * @api {get} /sharing/:id/:docid/files/:key Get shared document's file.
   * @apiVersion 2.0.0
   * @apiName GetSharedDocumentFile
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id Id of the sharing.
   * @apiParam {String} docid Id of the document.
   * @apiParam {String} key Key of the attachment.
   *
   * @apiSuccess {Document} document The document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       document: {
   *         "id": "xxxxx"
   *         "title": "Bla bla bla",
   *         "contentType": "text/html",
   *         "content": "<p>bla bla bla</p>"
   *       }
   *     }
   */
  router.get('/sharing/:sid/:docid/files/:key', middleware.sharing.get, middleware.document, controller.attachment.get)
}
