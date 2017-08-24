'use strict'

const broker = require('../../event-broker/client')

/**
 * User event handler.
 */
module.exports = function (userEventHandler) {
  // Exit if disabled...
  if (broker.disabled) {
    return
  }

  userEventHandler.on('create', (user) => {
    broker.emit('user.create', user)
  })

  userEventHandler.on('remove', (user) => {
    broker.emit('user.remove', user)
  })
}
