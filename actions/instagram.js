const path = require('path')
const Client = require('instagram-private-api').V1

const settings = require('nconf').get().actions.instagram
const cookiePath = path.join('/tmp', settings.account + '.json')

var device = new Client.Device(settings.account)
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

      Client.Session.create(device, storage, settings.account, settings.password)
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
