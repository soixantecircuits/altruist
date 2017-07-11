const path = require('path')
const Client = require('instagram-private-api').V1

const settings = require('../src/lib/settings').actions.instagram
const cookiePath = path.join('/tmp', settings.account + '.json')

var device = new Client.Device(settings.account)
var storage = new Client.CookieFileStorage(cookiePath)

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      if (!options.media || !Array.isArray(options.media) || options.media.length < 1) {
        return reject(new Error('No media provided in request'))
      }

      if (!options.media[0].path) {
        return reject(new Error('The media provided has no path'))
      }

      Client.Session.create(device, storage, settings.account, settings.password)
        .then((session) => {
          Client.Upload.photo(session, options.media[0].path)
            .then((upload) => {
              console.log('Uploading ' + options.media[0].name)
              return Client.Media.configurePhoto(session, upload.params.uploadId, options.caption)
            })
            .then((response) => resolve(response))
            .catch((err) => reject(err))
        })
    })
  }
}
