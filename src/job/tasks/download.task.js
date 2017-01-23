const AbstractTask = require('./abstract-task.js')
const downloadService = require('../../service/download.service')

class DownloadTask extends AbstractTask {
  /**
   * Download task.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    const { resources, container } = job.data
    downloadService.promiseDownload(resources, container)
      .then(() => {
        job.log('Resources downloaded')
        done()
      }, (err) => {
        job.log('Unable to download resources', err)
        done(err)
      })
  }
}

module.exports = DownloadTask
