'use strict'

const metrics = require('../../metrics/client')

/**
 * User event handler.
 */
module.exports = function (userEventHandler) {
  // Exit if disabled...
  if (metrics.disabled) {
    return
  }

  userEventHandler.on('create', (user) => {
    metrics.increment(`user.create,uid=${user.uid}`)
  })

  userEventHandler.on('update', (user) => {
    metrics.increment(`user.update,uid=${user.uid}`)
  })

  userEventHandler.on('unauthorized', (user) => {
    metrics.increment(`login.unauthorized,uid=${user.uid}`)
  })
}
