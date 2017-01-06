const path = require('path')
const Client = require('instagram-private-api').V1

const config = require('../src/lib/config').actions.instagram
const cookiePath = path.join('/tmp', config.account + '.json')

var device = new Client.Device(config.account)
var storage = new Client.CookieFileStorage(cookiePath)

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      if (options.media === undefined || options.media === '') {
        return reject({
          error: 'invalid request',
          details: 'Error: No media in request'
        })
      }

      Client.Session.create(device, storage, config.account, config.password)
        .then((session) => {
          Client.Upload.photo(session, options.media)
            .then((upload) => {
              console.log('Uploading ' + path.basename(options.media))
              return Client.Media.configurePhoto(session, upload.params.uploadId, options.caption)
            })
            .then((response) => resolve('Success'))
            .catch((err) => reject({
              error: err.name,
              details: err.message
            }))
        })
    })
  }
}
