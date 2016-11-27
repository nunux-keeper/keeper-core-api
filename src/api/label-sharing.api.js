'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Label sharing API.
 */
module.exports = function (router) {
  /**
   * @apiDefineSuccessStructure Sharing
   * @apiSuccess {String}  id    Sharing ID.
   * @apiSuccess {String}  targetLabel Label target ID.
   * @apiSuccess {Boolean} public      Public flag.
   * @apiSuccess {Date}    date        Modification date.
   * @apiSuccess {Date}    startDate   Start date of validity.
   * @apiSuccess {Date}    endDate     End date of validity.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "id": "xxxxx"
   *        "targetLabel": "123456789",
   *        "public": false,
   *        "date": "1479244330966",
   *        "startDate": "1479244330966",
   *        "endDate": null
   *     }
   */

  /**
   * @api {get} /label/:id/sharing Get label sharing details.
   * @apiVersion 2.0.0
   * @apiName GetLabelSharingDetails
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiSuccessStructure Sharing
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "id": "xxxxx"
   *       "targetClass": "label",
   *       "targetId": "123456789"
   *     }
   */
  router.get('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.get)

  /**
   * @api {put} /label/:id/sharing Update label sharing details.
   * @apiVersion 2.0.0
   * @apiName UpdateLabelSharingDetails
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id ID of the label.
   * @apiParam {Object} sharing Sharing to update.
   * @apiParam {Date} sharing.starDate Start date of validity.
   * @apiParam {Date} sharing.endDate End date of validity.
   *
   * @apiSuccessStructure Sharing
   */
  router.put('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.update)

  /**
   * @api {post} /label/:id/sharing Create a sharing on a label.
   * @apiVersion 2.0.0
   * @apiName CreateSharedLabel
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id ID of the label.
   * @apiParam {Object} sharing Sharing to create.
   * @apiParam {Date} sharing.starDate Start date of validity.
   * @apiParam {Date} sharing.endDate End date of validity.
   *
   * @apiSuccessStructure Sharing
   */
  router.post('/label/:labelId/sharing', middleware.label, controller.sharing.create)

  /**
   * @api {delete} /label/:id/sharing Delete a sharing on a label.
   * @apiVersion 2.0.0
   * @apiName DeleteLabelSharing
   * @apiGroup sharing
   * @apiPermission user
   *
   * @apiParam {String} id Id of the sharing.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.del)
}
