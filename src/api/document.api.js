'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Document API.
 */
module.exports = function (router) {
  /**
   * @apiDefineSuccessStructure Document
   * @apiSuccess {String}   id          ID of the document.
   * @apiSuccess {String}   title       Title of the document.
   * @apiSuccess {String}   content     Content of the document.
   * @apiSuccess {String}   contentType Content type of the document.
   * @apiSuccess {String}   date        Date of modification.
   * @apiSuccess {String}   origin      Ref. link.
   * @apiSuccess {String[]} labels      Labels of the document.
   * @apiSuccess {Object[]} attachments Document attachements.
   * @apiSuccess {String}   attachments.key          Attachement key.
   * @apiSuccess {String}   attachments.contentType  Attachement content type.
   * @apiSuccess {String}   attachments.origin       Attachement origin link.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "_id": "533d8b2be5ded24050aeed13",
   *        "title": "Bla bla",
   *        "content": "<p>bla bla bla...</p>",
   *        "contentType": "text/html",
   *        "date": "2014-04-08T08:32:28.308Z",
   *        "origin": "http://foo.bar",
   *        "labels": ["123456789", "987654321"],
   *        "attachments": [{
   *          "key": "1234567890",
   *          "contentType": "image/png",
   *          "origin": "http://foo.bar/foo.png"
   *        }]
   *     }
   */

  /**
   * @api {get} /document Search documents.
   * @apiVersion 2.0.0
   * @apiName SearchDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String}  [q]     Search query
   * @apiParam {Integer} [from]  Item index from
   * @apiParam {Integer} [size]  Nb of items to retrieve
   * @apiParam {String}  [order] Sort order (asc or desc)
   *
   * @apiSuccess {Integer}  total             Total nb of documents found.
   * @apiSuccess {Object[]} hits              Documents found.
   * @apiSuccess {String}   hits._id          ID of the document.
   * @apiSuccess {String}   hits.title        Title of the document.
   * @apiSuccess {String[]} hits.labels       Labels of the document.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "total": 123,
   *        hits: [{
   *          "_id": "544272014c7473672f95d849",
   *          "title": "Foo",
   *          "labels": ["123456789", "987654321"]
   *        },
   *        {...}
   *        ]
   *     }
   */
  router.get('/document', controller.document.search)

  /**
   * @api {get} /document Get a document.
   * @apiVersion 2.0.0
   * @apiName GetDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id    ID of the document
   * @apiParam {String} [raw] Get RAW document if set
   *
   * @apiSuccessStructure Document
   */
  router.get('/document/:id', middleware.document, controller.document.get)

  /**
   * @api {put} /document/:id Update a document.
   * @apiVersion 2.0.0
   * @apiName UpdateDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String}   id                 ID of the document
   * @apiParam {Object}   document           Document details to update
   * @apiParam {String}   [document.title]   Title of the document.
   * @apiParam {String}   [document.content] Content of the document.
   * @apiParam {String[]} [document.labels]  Labels of the document.
   *
   * @apiSuccessStructure Document
   */
  router.put('/document/:id', middleware.document, controller.document.update)

  /**
   * @api {post} /document Create a document.
   *
   * @apiVersion 2.0.0
   * @apiName CreateDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {Object}   document               Document details to update
   * @apiParam {String}   [document.title]       Title of the document.
   * @apiParam {String}   [document.origin]      Document origin url.
   * @apiParam {String}   [document.content]     Content of the document.
   * @apiParam {String}   [document.contentType] Content type of the document (text/*).
   * @apiParam {String[]} [document.labels]      Labels of the document.
   * @apiParam {File[]}   [files]                Attachments file(s).
   *
   * @apiSuccessStructure Document
   */
  router.post('/document', controller.document.create)

  /**
   * @api {delete} /document/:id Delete a document.
   * @apiVersion 2.0.0
   * @apiName DeleteDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id ID of the document
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/document/:id', middleware.document, controller.document.del)

  /**
   * @api {post} /document/:id/restore Restore a deleted document.
   * @apiVersion 2.0.0
   * @apiName RestoreDeletedDocument
   * @apiGroup document
   * @apiPermission user
   *
   * @apiParam {String} id Id of the deleted document.
   *
   * @apiSuccessStructure Document
   */
  router.post('/document/:id/restore', controller.document.restore)
}
