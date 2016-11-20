'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Gravatar API.
 */
module.exports = function (router) {
  /**
   * @api {get} /graveyard Find documents of graveyard.
   * @apiVersion 2.0.0
   * @apiName FindGhosts
   * @apiGroup graveyard
   * @apiPermission user
   *
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
  router.get('/graveyard', middleware.graveyard.ghost, controller.document.search)

  /**
   * @api {delete} /graveyard/:id Remove a document from the graveyard.
   * @apiVersion 2.0.0
   * @apiName DeleteFromGraveyard
   * @apiGroup graveyard
   * @apiPermission user
   *
   * @apiParam {String} id ID of the document
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/graveyard/:docid', controller.document.destroy)

  /**
   * @api {delete} /graveyard Remove permanently all documents of the graveyard.
   * @apiVersion 2.0.0
   * @apiName EmptyGraveyard
   * @apiGroup graveyard
   * @apiPermission user
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/graveyard', controller.document.emptyGraveyard)
}
