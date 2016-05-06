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
   * @api {get} /label Request all user's labels
   * @apiVersion 0.0.1
   * @apiName GetAllLabels
   * @apiGroup label
   * @apiPermission user
   *
   * @apiSuccessStructure Label
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     [{
   *        "id": "xxxxx"
   *        "label": "Foo",
   *        "color": "#FE2EC8"
   *     },
   *     {...}
   *     ]
   */
  router.get('/label', controller.label.all)

  /**
   * @api {put} /label/:id Update label details
   * @apiVersion 0.0.1
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
  router.put('/label/:id', middleware.label, controller.label.update)

  /**
   * @api {post} /label Create label
   * @apiVersion 0.0.1
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
   * @api {delete} /label/:id Delete label
   * @apiVersion 0.0.1
   * @apiName DeleteLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {String} id Id of the label.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 204 OK
   */
  router.delete('/label/:id', middleware.label, controller.label.del)

  /**
   * @api {post} /label/:id/restore Restore deleted label
   * @apiVersion 0.0.1
   * @apiName RestoreDeletedLabel
   * @apiGroup label
   * @apiPermission user
   *
   * @apiParam {String} id Id of the deleted label.
   *
   * @apiSuccessStructure Label
   */
  router.post('/label/:id/restore', controller.label.restore)
}
