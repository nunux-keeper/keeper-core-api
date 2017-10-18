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
    metrics.increment(`user_event,action=create,uid=${user.uid}`)
  })

  userEventHandler.on('update', (user) => {
    metrics.increment(`user_event,action=update,uid=${user.uid}`)
  })

  userEventHandler.on('remove', (user) => {
    metrics.increment(`user_event,action=remove,uid=${user.uid}`)
  })

  userEventHandler.on('unauthorized', (user) => {
    metrics.increment(`user_event,action=login-failed,uid=${user.uid}`)
  })
}
