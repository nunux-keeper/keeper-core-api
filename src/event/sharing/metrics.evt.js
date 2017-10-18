'use strict'

const metrics = require('../../metrics/client')

/**
 * Sharing event handler.
 */
module.exports = function (sharingEventHandler) {
  // Exit if disabled...
  if (metrics.disabled) {
    return
  }

  sharingEventHandler.on('create', (sharing) => {
    metrics.increment(`sharing_event,action=create,owner=${sharing.owner}`)
  })

  sharingEventHandler.on('update', (sharing) => {
    metrics.increment(`sharing_event,action=update,owner=${sharing.owner}`)
  })

  sharingEventHandler.on('remove', (sharing) => {
    metrics.increment(`sharing_event,action=remove,owner=${sharing.owner}`)
  })
}
