'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Label API.
 */
module.exports = function (router) {
  /**
   * @apiDefineSuccessStructure Label
   * @apiSuccess {String} id    Label ID.
   * @apiSuccess {String} label Label value.
   * @apiSuccess {String} color Color.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "id": "xxxxx"
   *        "label": "Foo",
   *        "color": "#FE2EC8"
   *     }
   */

  /**
   * @api {get} /label Get all user's labels.
   * @apiVersion 2.0.0
   * @apiName GetAllLabels
   * @apiGroup label
   * @apiPermission user
   *
   * @apiSuccess {Label[]} labels List of labels.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       labels: [
   *         {
   *           "id": "xxxxx"
   *           "label": "Foo",
   *           "color": "#FE2EC8"
   *         },
   *         {...}
   *       ]
   *     }
   */
  router.get('/label', controller.label.all)

  /**
   * @api {get} /label/:id Get label details.
   * @apiVersion 2.0.0
   * @apiName GetLabelDetail
   * @apiGroup label
   * @apiPermission user
   *
   * @apiSuccessStructure Label
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "id": "xxxxx"
   *       "label": "Foo",
   *       "color": "#FE2EC8"
   *     }
   */
  router.get('/label/:labelId', middleware.label, controller.label.get)

  /**
   * @api {put} /label/:id Update label details.
   * @apiVersion 2.0.0
   * @apiName UpdateLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {String} id ID of the label.
   * @apiParam {Object} label Label to update.
   * @apiParam {String} label.label Value of the label.
   * @apiParam {String} label.color Color of the label.
   *
   * @apiSuccessStructure Label
   */
  router.put('/label/:labelId', middleware.label, controller.label.update)

  /**
   * @api {post} /label Create new label.
   * @apiVersion 2.0.0
   * @apiName CreateLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {Object} label Label to create.
   * @apiParam {String} label.label Value of the label.
   * @apiParam {String} label.color Color of the label.
   *
   * @apiSuccessStructure Label
   */
  router.post('/label', controller.label.create)

  /**
   * @api {delete} /label/:id Delete a label.
   * @apiVersion 2.0.0
   * @apiName DeleteLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {String} id Id of the label.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/label/:labelId', middleware.label, controller.label.del)

  /**
   * @api {post} /label/:id/restore Restore a deleted label.
   * @apiVersion 2.0.0
   * @apiName RestoreDeletedLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {String} id Id of the deleted label.
   *
   * @apiSuccessStructure Label
   */
  router.post('/label/:labelId/restore', controller.label.restore)
}
